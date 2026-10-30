import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  History,
  Sliders,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onExportCsv?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onExportCsv }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'inspect', label: 'Inspect Studio', icon: ScanEye, badge: 'Live AI' },
    { id: 'history', label: 'Audit History', icon: History, badge: null },
    { id: 'settings', label: 'Rules & Profiles', icon: Sliders, badge: null },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0d131f]/70 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-3 mb-2">
            Operations Hub
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Inspection Action */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/30 border border-cyan-800/30">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Visual Ingestion</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Drag images or scrub video frames directly into the inspection model.
          </p>
          <button
            onClick={() => setCurrentTab('inspect')}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-cyan-500/20 transition flex items-center justify-center space-x-1.5"
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        </div>

        {/* Audit Export Shortcut */}
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV Audit Log</span>
          </button>
        )}
      </div>

      {/* RLS Policy Context Indicator */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Session Access</span>
            <span className="font-mono text-cyan-400 font-semibold uppercase">{user?.role}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {user?.role === 'operator' && 'Filtering: Limited to user uploaded records.'}
            {user?.role === 'inspector' && 'Full QA clearance: Can override & approve.'}
            {user?.role === 'admin' && 'Enterprise root: Global audit & policy edit.'}
          </div>
        </div>
      </div>
    </aside>
  );
};
