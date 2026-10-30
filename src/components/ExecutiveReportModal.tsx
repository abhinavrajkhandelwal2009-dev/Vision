import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Scan,
  Download,
  Calendar,
  User,
  CheckCircle2
} from 'lucide-react';
import { Inspection } from '../server/types.ts';

interface ExecutiveReportModalProps {
  inspection: Inspection | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  inspection,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !inspection) return null;

  const { raw_ai_output } = inspection;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
            <Scan className="w-4 h-4" />
            <span>Executive Audit & Compliance Report</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 bg-slate-950 text-slate-200 print:bg-white print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 print:border-slate-300 pb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white print:text-black">
                  Vision<span className="text-cyan-400 print:text-blue-600">Intel</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 text-cyan-300 print:text-slate-800 font-bold">
                  VERIFIED AUDIT REPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Automated Multi-Modal Computer Vision & Quality Assurance Certificate
              </p>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div>
                <span className="text-slate-400 print:text-slate-600">Report Ref: </span>
                <span className="font-bold text-cyan-300 print:text-blue-600">{inspection.id}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Generated: </span>
                <span>{new Date(inspection.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Model Engine: </span>
                <span>Gemini 3.8 Flash Vision</span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono font-semibold">Inspection Domain</div>
              <div className="font-bold text-white print:text-black mt-0.5">{inspection.domain}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono font-semibold">Inspection Status</div>
              <div className="font-bold uppercase font-mono text-cyan-400 print:text-blue-600 mt-0.5">
                {inspection.status}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono font-semibold">Model Confidence</div>
              <div className="font-bold font-mono text-emerald-400 print:text-emerald-700 mt-0.5">
                {inspection.confidence_score}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono font-semibold">Inspector / Operator</div>
              <div className="font-bold text-white print:text-black mt-0.5">
                {inspection.user_name || 'System Operator'}
              </div>
            </div>
          </div>

          {/* Visual Asset & Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl overflow-hidden border border-slate-800 print:border-slate-300 bg-black max-h-72 flex items-center justify-center">
              <img
                src={inspection.image_url}
                alt="Inspected Sample"
                className="w-full h-full object-contain max-h-72"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase font-mono text-cyan-400 print:text-blue-600 mb-1">
                  1. Executive AI Analysis
                </h4>
                <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed bg-slate-900/40 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-200">
                  {raw_ai_output.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase font-mono text-cyan-400 print:text-blue-600 mb-1">
                  2. Operational Directive & Recommended Actions
                </h4>
                <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed bg-slate-900/40 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-200">
                  {raw_ai_output.recommendedAction}
                </p>
              </div>
            </div>
          </div>

          {/* Anomalies Table */}
          <div>
            <h4 className="text-xs font-bold uppercase font-mono text-cyan-400 print:text-blue-600 mb-2">
              3. Detected Anomaly Manifest ({raw_ai_output.anomaliesDetected.length} items)
            </h4>

            {raw_ai_output.anomaliesDetected.length === 0 ? (
              <div className="p-3 bg-emerald-950/20 print:bg-emerald-50 rounded-xl border border-emerald-900 print:border-emerald-200 text-xs text-emerald-400 print:text-emerald-800">
                Inspection fully certified. Zero structural defects or compliance anomalies detected.
              </div>
            ) : (
              <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-[11px] font-mono text-slate-400 print:text-slate-600">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Coordinates (0-1000)</th>
                      <th className="p-2.5">Observation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                    {raw_ai_output.anomaliesDetected.map((anomaly, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 print:hover:bg-transparent">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-white print:text-black">{anomaly.title}</td>
                        <td className="p-2.5">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200">
                            {anomaly.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-cyan-400 print:text-blue-600">
                          {anomaly.boundingBox
                            ? `[${anomaly.boundingBox.ymin}, ${anomaly.boundingBox.xmin}, ${anomaly.boundingBox.ymax}, ${anomaly.boundingBox.xmax}]`
                            : 'N/A'}
                        </td>
                        <td className="p-2.5 text-slate-300 print:text-slate-700">{anomaly.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operator Audit & Sign-off Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono font-semibold mb-1">
                Operator Notes & Log:
              </div>
              <p className="text-slate-300 print:text-slate-800 italic">
                {inspection.operator_notes || 'No manual notes appended. Model assessment validated.'}
              </p>
            </div>

            <div className="flex flex-col items-end justify-end space-y-1">
              <div className="w-48 border-b border-slate-700 print:border-slate-400 pb-1 text-center font-mono text-[10px] text-slate-400">
                Authorizing QA Signature
              </div>
              <div className="text-[10px] text-slate-500">VisionIntelligence Cryptographic Verification Token</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
