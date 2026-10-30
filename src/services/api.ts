import { SafeUser, Inspection, RawAiOutput, InspectionStatus, UserRole } from '../server/types.ts';

const TOKEN_KEY = 'vision_intel_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
    const res = await request<{ user: SafeUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: { email: string; password: string; fullName: string; role?: UserRole }): Promise<{ user: SafeUser; token: string }> {
    const res = await request<{ user: SafeUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: SafeUser }> {
    return request<{ user: SafeUser }>('/api/auth/me');
  },

  // Inspections
  async runInspection(payload: {
    domain: string;
    imageBase64: string;
    mimeType: string;
    threshold?: number;
    customInstructions?: string;
  }): Promise<{ success: boolean; inspection: Inspection; latencyMs: number }> {
    return request<{ success: boolean; inspection: Inspection; latencyMs: number }>('/api/inspect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getInspections(filters?: { domain?: string; status?: string; search?: string }): Promise<{ count: number; inspections: Inspection[] }> {
    const params = new URLSearchParams();
    if (filters?.domain && filters.domain !== 'ALL') params.append('domain', filters.domain);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ count: number; inspections: Inspection[] }>(`/api/inspections${query}`);
  },

  async getInspectionById(id: string): Promise<{ inspection: Inspection }> {
    return request<{ inspection: Inspection }>(`/api/inspections/${id}`);
  },

  async updateInspection(id: string, updates: { status?: InspectionStatus; operator_notes?: string }): Promise<{ inspection: Inspection }> {
    return request<{ inspection: Inspection }>(`/api/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getAnalyticsSummary(): Promise<{
    totalInspections: number;
    passedCount: number;
    failedCount: number;
    flaggedCount: number;
    passRate: number;
    averageConfidence: number;
    averageLatencyMs: number;
    severities: { critical: number; high: number; medium: number; low: number };
    domains: Record<string, number>;
    recentActivity: Inspection[];
  }> {
    return request('/api/analytics/summary');
  },

  async exportCsv(): Promise<void> {
    const token = getAuthToken();
    const res = await fetch('/api/export/csv', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      throw new Error('Failed to export CSV report');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision_inspections_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
