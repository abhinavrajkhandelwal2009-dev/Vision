import React, { useState } from 'react';
import {
  Scan,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../server/types.ts';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, switchRoleDemo, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await switchRoleDemo(role);
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-xl shadow-cyan-500/25 text-white mb-2">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Vision<span className="text-cyan-400">Intel</span> Platform
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access automated computer vision inspection and quality telemetry.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          {(localError || error) && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@visionintel.ai"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Instant Demo Accounts for fast evaluation */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>One-Click Test Accounts:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Auto-credentials</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('operator')}
                className="py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-[11px] font-medium transition"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('inspector')}
                className="py-1.5 px-2 rounded-lg bg-blue-950/40 hover:bg-blue-950/80 border border-blue-800/40 text-blue-300 text-[11px] font-medium transition"
              >
                Lead QA
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 rounded-lg bg-purple-950/40 hover:bg-purple-950/80 border border-purple-800/40 text-purple-300 text-[11px] font-medium transition"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Register Switch */}
        <div className="text-center text-xs text-slate-400">
          Need a new inspection account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
