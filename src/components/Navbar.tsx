import React, { useState } from 'react';
import {
  Scan,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../server/types.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, switchRoleDemo } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'inspector':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'operator':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Scan className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0d131f]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Vision<span className="text-cyan-400">Intel</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold tracking-wider">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Automated Computer Vision & Defect Intelligence</p>
          </div>
        </div>

        {/* Center Engine Status (Desktop) */}
        <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1.5 text-slate-300">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
            <span>Gemini 3.8 Flash Vision</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostgreSQL RLS Protected</span>
          </div>
        </div>

        {/* User profile & Role switcher */}
        <div className="flex items-center space-x-3">
          {/* Quick RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${getRoleBadgeColor(
                user?.role
              )} hover:opacity-90`}
              title="Click to switch role to test RLS permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="capitalize">{user?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Role-Based Access (RLS)
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchRoleDemo('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                      user?.role === 'admin' ? 'bg-purple-950/60 text-purple-200 border border-purple-800/40' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">Administrator</div>
                      <div className="text-[10px] text-slate-400">Global read/write, audit override</div>
                    </div>
                    {user?.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRoleDemo('inspector');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                      user?.role === 'inspector' ? 'bg-blue-950/60 text-blue-200 border border-blue-800/40' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">Lead Inspector</div>
                      <div className="text-[10px] text-slate-400">Review all batches, sign off defects</div>
                    </div>
                    {user?.role === 'inspector' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRoleDemo('operator');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                      user?.role === 'operator' ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/40' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">Line Operator</div>
                      <div className="text-[10px] text-slate-400">Upload & inspect own records only</div>
                    </div>
                    {user?.role === 'operator' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-semibold">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <span className="text-xs text-slate-300 hidden sm:inline-block max-w-[120px] truncate">
                {user?.full_name || 'Account'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-xs">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <div className="font-semibold text-white text-sm truncate">{user?.full_name}</div>
                  <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      ID: {user?.id.slice(0, 10)}...
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center space-x-2"
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    <span>System & Model Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
