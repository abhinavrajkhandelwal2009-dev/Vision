import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { Inspection, InspectionStatus } from '../server/types.ts';

interface HistoryTableProps {
  inspections: Inspection[];
  onSelectInspection: (inspection: Inspection) => void;
  onOpenReportModal: (inspection: Inspection) => void;
  onExportCsv: () => void;
  isLoading?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  inspections,
  onSelectInspection,
  onOpenReportModal,
  onExportCsv,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter list
  const filtered = inspections.filter((item) => {
    const matchesDomain = selectedDomain === 'ALL' || item.domain.toLowerCase() === selectedDomain.toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' || item.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.raw_ai_output.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user_name && item.user_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDomain && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>PASSED</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>FAILED</span>
          </span>
        );
      case 'flagged_for_review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>FLAGGED</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, domain, defect keywords, or operator..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Domains</option>
            <option value="Industrial Manufacturing">Industrial Manufacturing</option>
            <option value="Infrastructure & Safety">Infrastructure & Safety</option>
            <option value="Retail & Inventory">Retail & Inventory</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="flagged_for_review">Flagged</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Asset</th>
                <th className="p-3.5">Job ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Defects</th>
                <th className="p-3.5">Inspector / Operator</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Loading historical inspections...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No inspections match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const anomalyCount = item.raw_ai_output?.anomaliesDetected?.length || 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                      onClick={() => onSelectInspection(item)}
                    >
                      {/* Image Thumbnail */}
                      <td className="p-3.5 pl-4">
                        <img
                          src={item.image_url}
                          alt="Thumbnail"
                          className="w-11 h-11 rounded-lg object-cover border border-slate-700 bg-black"
                        />
                      </td>

                      {/* Job ID */}
                      <td className="p-3.5 font-mono text-cyan-300 font-semibold group-hover:underline">
                        {item.id}
                      </td>

                      {/* Timestamp */}
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Domain */}
                      <td className="p-3.5 font-medium text-slate-200 whitespace-nowrap">
                        {item.domain}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Confidence Score */}
                      <td className="p-3.5 font-mono text-slate-200 whitespace-nowrap">
                        <span className="font-bold text-cyan-400">{item.confidence_score}%</span>
                      </td>

                      {/* Defects */}
                      <td className="p-3.5 whitespace-nowrap">
                        {anomalyCount === 0 ? (
                          <span className="text-[11px] font-mono text-emerald-400">Clean (0)</span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 font-mono text-[11px] font-semibold border border-rose-800/40">
                            <span>{anomalyCount} detected</span>
                          </span>
                        )}
                      </td>

                      {/* Operator */}
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[130px]">{item.user_name || 'Operator'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right pr-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectInspection(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 border border-slate-700 transition"
                            title="Open in Inspection HUD"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenReportModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            title="View Certificate Report"
                          >
                            <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="text-white font-mono">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
            <span className="text-white font-mono">{filtered.length}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
