import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  Key,
  CheckCircle2,
  Database,
  Server,
  User,
  Zap,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const SettingsPage: React.FC = () => {
  const { user, switchRoleDemo } = useAuth();
  const [defaultThreshold, setDefaultThreshold] = useState<number>(80);
  const [autoFlagCritical, setAutoFlagCritical] = useState<boolean>(true);
  const [highResSampling, setHighResSampling] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<boolean>(false);

  const handleSavePreferences = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">System & Model Configuration</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage computer vision heuristics, role permissions, and AI engine telemetry parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile & Role Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Authenticated Profile & RBAC Role</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Operator Name:</span>
              <span className="text-xs font-bold text-white">{user?.full_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Email Address:</span>
              <span className="text-xs font-mono text-cyan-300">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Assigned Role:</span>
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {user?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Switch Test Role (Demonstrate RLS & Permission Policies):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => switchRoleDemo('operator')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  user?.role === 'operator'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Operator
              </button>
              <button
                onClick={() => switchRoleDemo('inspector')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  user?.role === 'inspector'
                    ? 'bg-blue-950 text-blue-300 border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Inspector
              </button>
              <button
                onClick={() => switchRoleDemo('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  user?.role === 'admin'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Vision AI Inference Heuristics */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Inspection Heuristics & Rules</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">Global Sensitivity Confidence Threshold:</span>
                <span className="font-mono text-cyan-400 font-bold">{defaultThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Quarantine on Critical Defect</div>
                <div className="text-[10px] text-slate-400">Automatically flag lots with structural fractures</div>
              </div>
              <input
                type="checkbox"
                checked={autoFlagCritical}
                onChange={(e) => setAutoFlagCritical(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">High-Fidelity Coordinate Normalization</div>
                <div className="text-[10px] text-slate-400">Map bounding boxes strictly to 0-1000 scale</div>
              </div>
              <input
                type="checkbox"
                checked={highResSampling}
                onChange={(e) => setHighResSampling(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/30 transition"
          >
            {saveNotice ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Defaults</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Architecture & AI Engine Diagnostics */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>System Engine Architecture Diagnostics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">AI Model Provider</div>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Gen AI SDK (@google/genai)</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">Model: gemini-3.8-flash</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Data Isolation Engine</div>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Row Level Security (RLS)</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Enforced per JWT claims</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Telemetry Header</div>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>User-Agent: aistudio-build</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Secure Server-Side Proxy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
