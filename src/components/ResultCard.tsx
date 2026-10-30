import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Download,
  Copy,
  Check,
  Save,
  MessageSquare,
  Wrench,
  Percent,
  ChevronRight
} from 'lucide-react';
import { Inspection, DetectedAnomaly, InspectionStatus } from '../server/types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ResultCardProps {
  inspection: Inspection;
  onUpdateInspection: (id: string, updates: { status?: InspectionStatus; operator_notes?: string }) => Promise<void>;
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
  onOpenReportModal: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  inspection,
  onUpdateInspection,
  hoveredIndex,
  onHoverIndex,
  onOpenReportModal,
}) => {
  const { user } = useAuth();
  const [operatorNotes, setOperatorNotes] = useState<string>(inspection.operator_notes || '');
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus>(inspection.status);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const { raw_ai_output } = inspection;
  const { summary, overallStatus, confidenceScore, anomaliesDetected, recommendedAction } = raw_ai_output;

  const handleSaveReview = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateInspection(inspection.id, {
        status: selectedStatus,
        operator_notes: operatorNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update inspection:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(raw_ai_output, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const getStatusBanner = () => {
    if (overallStatus === 'PASSED') {
      return {
        bg: 'from-emerald-950/80 to-slate-900 border-emerald-500/40 text-emerald-300',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        icon: ShieldCheck,
        label: 'PASSED - ALL SPECIFICATIONS MET',
      };
    } else if (overallStatus === 'FAILED') {
      return {
        bg: 'from-rose-950/80 to-slate-900 border-rose-500/40 text-rose-300',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        icon: AlertOctagon,
        label: 'FAILED - CRITICAL ANOMALIES DETECTED',
      };
    } else {
      return {
        bg: 'from-amber-950/80 to-slate-900 border-amber-500/40 text-amber-300',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        icon: AlertTriangle,
        label: 'FLAGGED - MANUAL QA AUDIT REQUIRED',
      };
    }
  };

  const banner = getStatusBanner();
  const BannerIcon = banner.icon;

  return (
    <div className="space-y-4">
      {/* Top AI Decision Card */}
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${banner.bg} border shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-700/60">
              <BannerIcon className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${banner.badge}`}>
                {banner.label}
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Domain: <span className="text-white font-medium">{inspection.domain}</span> • Job ID:{' '}
                <span className="font-mono text-cyan-300">{inspection.id}</span>
              </div>
            </div>
          </div>

          {/* Confidence Score Pill */}
          <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Model Confidence</div>
              <div className="text-lg font-bold font-mono text-cyan-300">{confidenceScore}%</div>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Executive AI Summary</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Detected Anomalies Breakdown */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Detected Anomalies & Defects ({anomaliesDetected.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Hover item to highlight bounding coordinates</span>
        </div>

        {anomaliesDetected.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-emerald-200">Zero Critical Anomalies Detected</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Asset conforms to active threshold rules.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {anomaliesDetected.map((anomaly, idx) => {
              const isHovered = hoveredIndex === idx;
              let severityBadge = 'bg-amber-950/80 text-amber-300 border-amber-600/40';
              if (anomaly.severity === 'CRITICAL') {
                severityBadge = 'bg-rose-950/80 text-rose-300 border-rose-600/40';
              } else if (anomaly.severity === 'HIGH') {
                severityBadge = 'bg-orange-950/80 text-orange-300 border-orange-600/40';
              } else if (anomaly.severity === 'LOW') {
                severityBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40';
              }

              return (
                <div
                  key={idx}
                  onMouseEnter={() => onHoverIndex(idx)}
                  onMouseLeave={() => onHoverIndex(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">#{idx + 1} {anomaly.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${severityBadge}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{anomaly.description}</p>

                  {anomaly.boundingBox && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      <span>Coordinates: [{anomaly.boundingBox.ymin}, {anomaly.boundingBox.xmin}, {anomaly.boundingBox.ymax}, {anomaly.boundingBox.xmax}]</span>
                      <span className="text-cyan-400 flex items-center space-x-0.5">
                        <span>Show on Canvas</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Action Protocol */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-900/40 p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/50 text-blue-400 shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
              Actionable Operational Recommendation
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Inspector / Operator Override Panel */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Operator Audit & Status Override
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Role: <span className="text-cyan-300 font-semibold">{user?.role}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Inspection Status Override:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as InspectionStatus)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 font-mono"
            >
              <option value="passed">PASSED (Approved for Release)</option>
              <option value="failed">FAILED (Quarantine / Diverted)</option>
              <option value="flagged_for_review">FLAGGED (Awaiting Senior QA)</option>
              <option value="pending">PENDING (In Progress)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Operator Log Notes:
            </label>
            <input
              type="text"
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="e.g. Batch #401 quarantined, verified with caliper gauge"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400">
            {saveSuccess && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Updated in PostgreSQL persistent audit store!</span>
              </span>
            )}
          </div>

          <button
            onClick={handleSaveReview}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition flex items-center space-x-1.5 shadow-md shadow-cyan-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Updating Record...' : 'Save Audit Status'}</span>
          </button>
        </div>
      </div>

      {/* Export & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          onClick={onOpenReportModal}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Executive PDF Report</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center space-x-1.5 transition"
            title="Copy structured JSON output"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
