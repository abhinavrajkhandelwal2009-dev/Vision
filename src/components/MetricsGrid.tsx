import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  Zap,
  TrendingUp,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface MetricsGridProps {
  summary: {
    totalInspections: number;
    passedCount: number;
    failedCount: number;
    flaggedCount: number;
    passRate: number;
    averageConfidence: number;
    averageLatencyMs: number;
    severities: { critical: number; high: number; medium: number; low: number };
    domains: Record<string, number>;
  };
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ summary }) => {
  const {
    totalInspections,
    passedCount,
    failedCount,
    flaggedCount,
    passRate,
    averageConfidence,
    averageLatencyMs,
    severities,
    domains,
  } = summary;

  const passedPct = totalInspections > 0 ? (passedCount / totalInspections) * 100 : 0;
  const failedPct = totalInspections > 0 ? (failedCount / totalInspections) * 100 : 0;
  const flaggedPct = totalInspections > 0 ? (flaggedCount / totalInspections) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspections */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Inspections</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">{totalInspections}</div>
          <div className="flex items-center space-x-1 text-[11px] text-cyan-400 font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Vision Ingestion</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Quality Pass Rate</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">{passRate}%</div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
            <span>Avg Confidence:</span>
            <span className="font-mono text-emerald-300 font-semibold">{averageConfidence}%</span>
          </div>
        </div>

        {/* Critical Anomalies */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Critical Anomalies</span>
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">{severities.critical}</div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
            <span>High Severity:</span>
            <span className="font-mono text-orange-300 font-semibold">{severities.high}</span>
          </div>
        </div>

        {/* AI Latency */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Inference Latency</span>
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/40 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 tracking-tight">{averageLatencyMs}ms</div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Gemini 3.8 Flash Core</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Segment: Pass/Fail Ratio & Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quality Distribution Bar */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Visual Quality Breakdown</h3>
              <p className="text-xs text-slate-400">Status ratio across all evaluated lots</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Passed ({passedCount})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">Failed ({failedCount})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">Flagged ({flaggedCount})</span>
              </span>
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div
              style={{ width: `${passedPct}%` }}
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
              title={`Passed: ${passedPct.toFixed(1)}%`}
            />
            <div
              style={{ width: `${failedPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
              title={`Failed: ${failedPct.toFixed(1)}%`}
            />
            <div
              style={{ width: `${flaggedPct}%` }}
              className="h-full bg-amber-500 rounded-r-full transition-all duration-500"
              title={`Flagged: ${flaggedPct.toFixed(1)}%`}
            />
          </div>

          {/* Anomaly Severity Chips */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-semibold">Anomalies by Severity:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/60">
                CRITICAL: {severities.critical}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-950/80 text-orange-300 border border-orange-800/60">
                HIGH: {severities.high}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60">
                MEDIUM: {severities.medium}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                LOW: {severities.low}
              </span>
            </div>
          </div>
        </div>

        {/* Domain Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Domain Volume</h3>
          </div>

          <div className="space-y-2.5">
            {Object.entries(domains).map(([domainName, count]) => {
              const pct = totalInspections > 0 ? Math.round((count / totalInspections) * 100) : 0;
              return (
                <div key={domainName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[170px]">{domainName}</span>
                    <span className="font-mono text-cyan-300 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
