import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Inspection } from '../server/types.ts';
import { MetricsGrid } from '../components/MetricsGrid.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardPageProps {
  onNavigateToInspect: () => void;
  onSelectInspection: (inspection: Inspection) => void;
  onOpenReportModal: (inspection: Inspection) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToInspect,
  onSelectInspection,
  onOpenReportModal,
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.getAnalyticsSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Aggregating visual intelligence telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e1726] border border-slate-800 p-6 shadow-2xl overflow-hidden">
        {/* Decorative Grid Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold uppercase">
                Active Session: {user?.role}
              </span>
              <span className="text-xs text-slate-400">• Vision Core v3.8</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Visual Intelligence Operations Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Real-time multi-modal defect detection, safety violation tracking, and automated compliance auditing powered by Google Gemini.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onNavigateToInspect}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
            >
              <ScanEye className="w-4 h-4" />
              <span>Launch New Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <MetricsGrid summary={summary} />

      {/* Recent Inspections Stream */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Visual Inspections</h2>
            <p className="text-xs text-slate-400">Latest evaluated job lots and audit records</p>
          </div>
          <button
            onClick={onNavigateToInspect}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Run New Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.recentActivity.map((inspection: Inspection) => {
            const anomalyCount = inspection.raw_ai_output?.anomaliesDetected?.length || 0;
            return (
              <div
                key={inspection.id}
                onClick={() => onSelectInspection(inspection)}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{inspection.id}</span>
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                        inspection.status === 'passed'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : inspection.status === 'failed'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {inspection.status}
                    </span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-black">
                    <img
                      src={inspection.image_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white font-semibold">
                      {inspection.confidence_score}% Confidence
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white truncate">{inspection.domain}</div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {inspection.raw_ai_output.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{anomalyCount} {anomalyCount === 1 ? 'anomaly' : 'anomalies'}</span>
                  <span className="text-cyan-400 group-hover:underline flex items-center space-x-1 font-medium">
                    <span>Inspect HUD</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
