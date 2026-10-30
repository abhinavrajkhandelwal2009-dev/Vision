import React, { useState, useEffect } from 'react';
import { History, FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';
import { HistoryTable } from '../components/HistoryTable.tsx';
import { ExecutiveReportModal } from '../components/ExecutiveReportModal.tsx';
import { Inspection } from '../server/types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface HistoryPageProps {
  onSelectInspection: (inspection: Inspection) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectInspection }) => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportModalInspection, setReportModalInspection] = useState<Inspection | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getInspections();
      setInspections(data.inspections);
    } catch (err) {
      console.error('Failed to load inspection history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleExportCsv = async () => {
    try {
      await api.exportCsv();
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Inspection History & Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all automated computer vision jobs, operator review overrides, and defect coordinates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh inspection logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Full CSV Audit</span>
          </button>
        </div>
      </div>

      {/* RLS Policy Context Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>PostgreSQL Row Level Security (RLS) Filter:</span>
          <span className="font-mono text-cyan-300 font-bold uppercase">{user?.role}</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {user?.role === 'operator'
            ? 'Displaying operator-restricted inspection records'
            : 'Displaying comprehensive organization-wide audit trail'}
        </span>
      </div>

      {/* Main Table */}
      <HistoryTable
        inspections={inspections}
        onSelectInspection={onSelectInspection}
        onOpenReportModal={(insp) => setReportModalInspection(insp)}
        onExportCsv={handleExportCsv}
        isLoading={loading}
      />

      {/* Report Modal */}
      <ExecutiveReportModal
        inspection={reportModalInspection}
        isOpen={!!reportModalInspection}
        onClose={() => setReportModalInspection(null)}
      />
    </div>
  );
};
