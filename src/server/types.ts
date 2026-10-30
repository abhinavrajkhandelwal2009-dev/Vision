export type UserRole = 'operator' | 'inspector' | 'admin';

export type InspectionStatus = 'pending' | 'passed' | 'failed' | 'flagged_for_review';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectedAnomaly {
  title: string;
  severity: AnomalySeverity;
  description: string;
  boundingBox?: BoundingBox;
}

export interface RawAiOutput {
  summary: string;
  overallStatus: 'PASSED' | 'FAILED' | 'FLAGGED';
  confidenceScore: number;
  anomaliesDetected: DetectedAnomaly[];
  recommendedAction: string;
}

export interface Inspection {
  id: string;
  user_id: string;
  domain: string;
  image_url: string;
  status: InspectionStatus;
  confidence_score: number;
  raw_ai_output: RawAiOutput;
  operator_notes?: string | null;
  created_at: string;
  // Joined fields for display
  user_name?: string;
  user_role?: UserRole;
}

export interface InspectionDomainTemplate {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  defaultThreshold: number;
  icon: string;
}
