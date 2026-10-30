import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  role: z.enum(['operator', 'inspector', 'admin']).optional().default('operator')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const inspectionRequestSchema = z.object({
  domain: z.string().min(2, 'Domain must be specified'),
  imageBase64: z.string().min(10, 'Valid base64 image data is required'),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp|jpg)$/, 'MIME type must be image/jpeg, image/png, or image/webp'),
  threshold: z.number().min(0).max(100).optional().default(75),
  customInstructions: z.string().optional()
});

export const updateInspectionSchema = z.object({
  status: z.enum(['pending', 'passed', 'failed', 'flagged_for_review']).optional(),
  operator_notes: z.string().optional()
});
