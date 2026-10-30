/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { InspectPage } from './pages/InspectPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ExecutiveReportModal } from './components/ExecutiveReportModal.tsx';
import { Inspection } from './server/types.ts';
import { api } from './services/api.ts';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Selected inspection for deep inspecting or report modal
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [reportModalInspection, setReportModalInspection] = useState<Inspection | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading VisionIntelligence Core Session...</p>
      </div>
    );
  }

  // If not authenticated, render Login/Register
  if (!user) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const handleSelectInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setCurrentTab('inspect');
  };

  const handleExportCsv = async () => {
    try {
      await api.exportCsv();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab !== 'inspect') {
              // reset active inspection selection if leaving inspect
            }
            setCurrentTab(tab);
          }}
          onExportCsv={handleExportCsv}
        />

        {/* Dynamic Route Workspace */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToInspect={() => {
                setSelectedInspection(null);
                setCurrentTab('inspect');
              }}
              onSelectInspection={handleSelectInspection}
              onOpenReportModal={(insp) => setReportModalInspection(insp)}
            />
          )}

          {currentTab === 'inspect' && (
            <InspectPage
              key={selectedInspection ? selectedInspection.id : 'new-inspection'}
              initialInspection={selectedInspection}
              onInspectionCreated={(newInsp) => {
                setSelectedInspection(newInsp);
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onSelectInspection={handleSelectInspection}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Executive Report Modal */}
      <ExecutiveReportModal
        inspection={reportModalInspection}
        isOpen={!!reportModalInspection}
        onClose={() => setReportModalInspection(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
