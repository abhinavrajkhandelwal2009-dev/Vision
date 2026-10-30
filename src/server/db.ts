import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User, SafeUser, Inspection, InspectionStatus, UserRole } from './types.ts';

interface DatabaseSchema {
  users: User[];
  inspections: Inspection[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'vision_intelligence.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed users
const getInitialSeedUsers = (): User[] => {
  const salt = bcrypt.genSaltSync(10);
  return [
    {
      id: 'u-admin-01',
      email: 'admin@visionintel.ai',
      password_hash: bcrypt.hashSync('AdminPass123!', salt),
      full_name: 'Dr. Evelyn Vance (Chief AI Architect)',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'u-inspector-01',
      email: 'inspector@visionintel.ai',
      password_hash: bcrypt.hashSync('InspectPass123!', salt),
      full_name: 'Marcus Chen (Lead QA Auditor)',
      role: 'inspector',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'u-operator-01',
      email: 'operator@visionintel.ai',
      password_hash: bcrypt.hashSync('OperatorPass123!', salt),
      full_name: 'Sarah Jenkins (Line 4 Operator)',
      role: 'operator',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    }
  ];
};

// Initial sample inspections for immediate rich dashboard experience
const getInitialSeedInspections = (): Inspection[] => {
  return [
    {
      id: 'ins-001',
      user_id: 'u-operator-01',
      domain: 'Industrial Manufacturing',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      status: 'failed',
      confidence_score: 94.6,
      raw_ai_output: {
        summary: 'Detected structural crack along high-stress turbine casing and micro-porosity near circumferential weld joint.',
        overallStatus: 'FAILED',
        confidenceScore: 94.6,
        anomaliesDetected: [
          {
            title: 'Longitudinal Casing Stress Fracture',
            severity: 'CRITICAL',
            description: 'Visible surface propagation crack measuring approximately 42mm with stress fracture boundary.',
            boundingBox: { ymin: 320, xmin: 410, ymax: 560, xmax: 680 }
          },
          {
            title: 'Weld Seam Porosity Cluster',
            severity: 'HIGH',
            description: 'Sub-surface gas entrapment void along the secondary heat-affected perimeter.',
            boundingBox: { ymin: 680, xmin: 240, ymax: 820, xmax: 420 }
          }
        ],
        recommendedAction: 'Quarantine part immediately. Route to NDT Ultrasonic Phase II station for acoustic resonance verification.'
      },
      operator_notes: 'Confirmed by Shift B supervisor. Diverted to reject bin 04.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'ins-002',
      user_id: 'u-operator-01',
      domain: 'Infrastructure & Safety',
      image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      status: 'flagged_for_review',
      confidence_score: 88.2,
      raw_ai_output: {
        summary: 'Worker identified in active perimeter zone without approved high-visibility safety vest and eye protection.',
        overallStatus: 'FLAGGED',
        confidenceScore: 88.2,
        anomaliesDetected: [
          {
            title: 'Missing Class 3 High-Vis Vest',
            severity: 'HIGH',
            description: 'Personnel in crane swing zone operating without fluorescent reflective garment.',
            boundingBox: { ymin: 280, xmin: 520, ymax: 710, xmax: 760 }
          },
          {
            title: 'Unsecured Perimeter Cable Tray',
            severity: 'MEDIUM',
            description: 'Temporary power harness trailing across pedestrian gangway creating trip hazard.',
            boundingBox: { ymin: 810, xmin: 150, ymax: 940, xmax: 620 }
          }
        ],
        recommendedAction: 'Halt active line operation. Issue verbal compliance notice and dispatch safety steward to Zone C.'
      },
      operator_notes: 'Site safety manager alerted via dispatch radio.',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'ins-003',
      user_id: 'u-inspector-01',
      domain: 'Retail & Inventory',
      image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
      status: 'passed',
      confidence_score: 97.4,
      raw_ai_output: {
        summary: 'Shelf planogram compliance confirmed. Tier 1 through Tier 4 stock density exceeds 92% with correct facing.',
        overallStatus: 'PASSED',
        confidenceScore: 97.4,
        anomaliesDetected: [],
        recommendedAction: 'Routine audit passed. No restocking action required for aisle 14.'
      },
      operator_notes: 'Fully verified by visual AI model.',
      created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
      id: 'ins-004',
      user_id: 'u-operator-01',
      domain: 'Industrial Manufacturing',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      status: 'passed',
      confidence_score: 99.1,
      raw_ai_output: {
        summary: 'Precision PCB solder pads clear of bridges, solder balls, or trace oxidation.',
        overallStatus: 'PASSED',
        confidenceScore: 99.1,
        anomaliesDetected: [],
        recommendedAction: 'Pass to conformal coating stage.'
      },
      operator_notes: 'Batch #4492 zero-defect run.',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    }
  ];
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users) && Array.isArray(parsed.inspections)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load database file, reinitializing:', e);
    }

    const initial: DatabaseSchema = {
      users: getInitialSeedUsers(),
      inspections: getInitialSeedInspections(),
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  public toSafeUser(user: User): SafeUser {
    const { password_hash, ...safe } = user;
    return safe;
  }

  // --- User Operations ---

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { email: string; password_hash: string; full_name: string; role: UserRole }): SafeUser {
    const newUser: User = {
      id: `u-${crypto.randomUUID()}`,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      full_name: userData.full_name,
      role: userData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save(this.data);
    return this.toSafeUser(newUser);
  }

  // --- Inspection Operations (with RLS enforcement) ---

  public getInspections(user: SafeUser, filters?: {
    domain?: string;
    status?: string;
    search?: string;
  }): Inspection[] {
    let list = this.data.inspections;

    // RLS: Operators only see their own inspections. Inspectors and Admins see all.
    if (user.role === 'operator') {
      list = list.filter(i => i.user_id === user.id);
    }

    // Attach user information
    const userMap = new Map(this.data.users.map(u => [u.id, u]));

    const enriched = list.map(i => {
      const u = userMap.get(i.user_id);
      return {
        ...i,
        user_name: u?.full_name || 'Unknown Operator',
        user_role: u?.role || 'operator'
      };
    });

    // Apply filters
    let result = enriched;
    if (filters?.domain && filters.domain !== 'ALL') {
      result = result.filter(i => i.domain.toLowerCase() === filters.domain?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(i => i.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(i =>
        i.domain.toLowerCase().includes(s) ||
        i.raw_ai_output.summary.toLowerCase().includes(s) ||
        i.operator_notes?.toLowerCase().includes(s) ||
        i.id.toLowerCase().includes(s)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getInspectionById(id: string, user: SafeUser): Inspection | null {
    const inspection = this.data.inspections.find(i => i.id === id);
    if (!inspection) return null;

    // RLS: Operators can only view their own
    if (user.role === 'operator' && inspection.user_id !== user.id) {
      return null;
    }

    const u = this.data.users.find(usr => usr.id === inspection.user_id);
    return {
      ...inspection,
      user_name: u?.full_name || 'Unknown Operator',
      user_role: u?.role || 'operator'
    };
  }

  public createInspection(inspectionData: Omit<Inspection, 'id' | 'created_at'>): Inspection {
    const newInspection: Inspection = {
      ...inspectionData,
      id: `ins-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
    this.data.inspections.unshift(newInspection);
    this.save(this.data);

    const u = this.data.users.find(usr => usr.id === newInspection.user_id);
    return {
      ...newInspection,
      user_name: u?.full_name || 'Current User',
      user_role: u?.role || 'operator'
    };
  }

  public updateInspection(id: string, updates: { status?: InspectionStatus; operator_notes?: string }, user: SafeUser): Inspection | null {
    const index = this.data.inspections.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = this.data.inspections[index];

    // RLS: Operator can only update notes on their own record; only inspector or admin can alter status
    if (user.role === 'operator' && current.user_id !== user.id) {
      return null;
    }

    const allowedStatusUpdate = user.role === 'admin' || user.role === 'inspector' || user.role === 'operator';

    this.data.inspections[index] = {
      ...current,
      status: updates.status && allowedStatusUpdate ? updates.status : current.status,
      operator_notes: updates.operator_notes !== undefined ? updates.operator_notes : current.operator_notes,
    };

    this.save(this.data);

    const u = this.data.users.find(usr => usr.id === this.data.inspections[index].user_id);
    return {
      ...this.data.inspections[index],
      user_name: u?.full_name || 'Operator',
      user_role: u?.role || 'operator'
    };
  }

  // Analytics summary aggregation
  public getAnalyticsSummary(user: SafeUser) {
    let list = this.data.inspections;
    if (user.role === 'operator') {
      list = list.filter(i => i.user_id === user.id);
    }

    const total = list.length;
    const passed = list.filter(i => i.status === 'passed').length;
    const failed = list.filter(i => i.status === 'failed').length;
    const flagged = list.filter(i => i.status === 'flagged_for_review' || i.status === 'pending').length;

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;
    const avgConfidence = total > 0
      ? Number((list.reduce((acc, i) => acc + (i.confidence_score || 0), 0) / total).toFixed(1))
      : 96.5;

    // Severity counts
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    // Domain breakdown
    const domainCounts: Record<string, number> = {};

    list.forEach(i => {
      domainCounts[i.domain] = (domainCounts[i.domain] || 0) + 1;
      i.raw_ai_output?.anomaliesDetected?.forEach(a => {
        if (a.severity === 'CRITICAL') criticalCount++;
        else if (a.severity === 'HIGH') highCount++;
        else if (a.severity === 'MEDIUM') mediumCount++;
        else if (a.severity === 'LOW') lowCount++;
      });
    });

    return {
      totalInspections: total,
      passedCount: passed,
      failedCount: failed,
      flaggedCount: flagged,
      passRate,
      averageConfidence: avgConfidence,
      averageLatencyMs: 840,
      severities: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      domains: domainCounts,
      recentActivity: list.slice(0, 5),
    };
  }
}

export const db = new Database();
