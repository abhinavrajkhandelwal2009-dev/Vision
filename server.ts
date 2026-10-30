import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { authMiddleware, generateToken, AuthenticatedRequest } from './src/server/authMiddleware.ts';
import { analyzeVisualAsset } from './src/server/geminiService.ts';
import {
  registerSchema,
  loginSchema,
  inspectionRequestSchema,
  updateInspectionSchema
} from './src/server/validation.ts';
import { InspectionStatus } from './src/server/types.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsing with 30mb limit for high-res vision frames
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// --- API ROUTES ---

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: 'VisionIntelligence AI Core',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// 2. Authentication: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message).join(', ')
      });
    }

    const { email, password, fullName, role } = parseResult.data;

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const safeUser = db.createUser({
      email,
      password_hash,
      full_name: fullName,
      role: role || 'operator'
    });

    const token = generateToken(safeUser);
    res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Registration failure:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 3. Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message).join(', ')
      });
    }

    const { email, password } = parseResult.data;
    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const safeUser = db.toSafeUser(user);
    const token = generateToken(safeUser);

    res.json({
      message: 'Authentication successful',
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Login failure:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 4. Authentication: Current Profile
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// 5. Run Inspection (Vision AI Ingestion & Analysis)
app.post('/api/inspect', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  try {
    const parseResult = inspectionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid inspection payload',
        details: parseResult.error.issues.map((e: any) => e.message).join(', ')
      });
    }

    const { domain, imageBase64, mimeType, threshold, customInstructions } = parseResult.data;

    // Execute Gemini Multi-Modal Visual Inspection
    const rawAiOutput = await analyzeVisualAsset(
      imageBase64,
      mimeType,
      domain,
      { threshold, customInstructions }
    );

    // Map AI overallStatus to database inspection_status
    let status: InspectionStatus = 'passed';
    if (rawAiOutput.overallStatus === 'FAILED') {
      status = 'failed';
    } else if (rawAiOutput.overallStatus === 'FLAGGED') {
      status = 'flagged_for_review';
    }

    // Persist to relational database
    const savedInspection = db.createInspection({
      user_id: req.user!.id,
      domain,
      image_url: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`,
      status,
      confidence_score: rawAiOutput.confidenceScore,
      raw_ai_output: rawAiOutput,
      operator_notes: customInstructions ? `Directive: ${customInstructions}` : null
    });

    const latencyMs = Date.now() - startTime;

    res.status(201).json({
      success: true,
      inspection: savedInspection,
      latencyMs
    });
  } catch (err: any) {
    console.error('Inspection failed:', err);
    res.status(500).json({ error: 'Inspection analysis failed.', details: err?.message });
  }
});

// 6. Get Historical Inspections (Paginated, Searchable, RLS Isolated)
app.get('/api/inspections', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const domain = req.query.domain as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const list = db.getInspections(req.user!, { domain, status, search });
    res.json({
      count: list.length,
      inspections: list
    });
  } catch (err: any) {
    console.error('Fetch inspections failed:', err);
    res.status(500).json({ error: 'Failed to retrieve historical inspections.' });
  }
});

// 7. Get Single Inspection Details
app.get('/api/inspections/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspection = db.getInspectionById(req.params.id, req.user!);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection record not found or access unauthorized.' });
    }
    res.json({ inspection });
  } catch (err: any) {
    res.status(500).json({ error: 'Error loading inspection details.' });
  }
});

// 8. Update Inspection Status or Operator Notes (Inspector / Admin override)
app.patch('/api/inspections/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = updateInspectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid update payload',
        details: parseResult.error.issues.map((e: any) => e.message).join(', ')
      });
    }

    const updated = db.updateInspection(
      req.params.id,
      {
        status: parseResult.data.status,
        operator_notes: parseResult.data.operator_notes
      },
      req.user!
    );

    if (!updated) {
      return res.status(404).json({ error: 'Inspection not found or insufficient privileges to update.' });
    }

    res.json({
      message: 'Inspection updated successfully',
      inspection: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inspection record.' });
  }
});

// 9. Analytics Summary
app.get('/api/analytics/summary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = db.getAnalyticsSummary(req.user!);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to aggregate analytics summary.' });
  }
});

// 10. CSV Export of Inspections
app.get('/api/export/csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspections = db.getInspections(req.user!);
    const headers = ['Inspection ID', 'Date', 'Operator', 'Role', 'Domain', 'Status', 'Confidence Score', 'Defects Count', 'Summary', 'Notes'];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = inspections.map(i => [
      i.id,
      i.created_at,
      i.user_name,
      i.user_role,
      i.domain,
      i.status.toUpperCase(),
      `${i.confidence_score}%`,
      i.raw_ai_output.anomaliesDetected?.length || 0,
      i.raw_ai_output.summary,
      i.operator_notes || ''
    ].map(escapeCsv).join(','));

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vision_intelligence_inspections_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// --- VITE DEV / STATIC SERVING INTEGRATION ---
async function startServer() {
  if (!isProduction) {
    // Dynamic import vite server for development middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VisionIntelligence AI] Server initialized on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
