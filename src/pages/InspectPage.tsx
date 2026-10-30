import React, { useState } from 'react';
import {
  ScanEye,
  Sliders,
  Sparkles,
  Layers,
  Wrench,
  ShieldAlert,
  ShoppingBag,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone.tsx';
import { InspectionCanvas } from '../components/InspectionCanvas.tsx';
import { ResultCard } from '../components/ResultCard.tsx';
import { ExecutiveReportModal } from '../components/ExecutiveReportModal.tsx';
import { Inspection, InspectionStatus } from '../server/types.ts';
import { api } from '../services/api.ts';

const DOMAIN_PROFILES = [
  {
    id: 'industrial',
    name: 'Industrial Manufacturing',
    desc: 'Surface cracks, weld defect porosity, mechanical assembly misalignments',
    icon: Wrench,
    defaultThreshold: 80,
    prompt: 'Check for physical stress cracks, weld seams, heat-affected zone defects, and component alignment tolerances.'
  },
  {
    id: 'safety',
    name: 'Infrastructure & Safety',
    desc: 'PPE compliance, hard hats, high-vis vests, trip hazards, egress obstructions',
    icon: ShieldAlert,
    defaultThreshold: 75,
    prompt: 'Audit for occupational safety: check personnel for PPE (hard hat, high-vis vest), trip hazards, and clearance zones.'
  },
  {
    id: 'retail',
    name: 'Retail & Inventory',
    desc: 'Planogram stock depletion, out-of-stock gaps, misplaced items, shelf audits',
    icon: ShoppingBag,
    defaultThreshold: 70,
    prompt: 'Audit shelf inventory: detect out-of-stock planogram voids, facings compliance, and displaced packaging.'
  },
  {
    id: 'custom',
    name: 'Custom Inspection Profile',
    desc: 'Custom user-specified computer vision parameters and target anomaly criteria',
    icon: Cpu,
    defaultThreshold: 85,
    prompt: ''
  }
];

interface InspectPageProps {
  initialInspection?: Inspection | null;
  onInspectionCreated?: (inspection: Inspection) => void;
}

export const InspectPage: React.FC<InspectPageProps> = ({
  initialInspection = null,
  onInspectionCreated,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>(
    initialInspection ? initialInspection.domain : 'Industrial Manufacturing'
  );
  const [threshold, setThreshold] = useState<number>(80);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customDomainName, setCustomDomainName] = useState<string>('');

  // Media state
  const [selectedBase64, setSelectedBase64] = useState<string | null>(
    initialInspection ? initialInspection.image_url : null
  );
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [selectedPreview, setSelectedPreview] = useState<string | null>(
    initialInspection ? initialInspection.image_url : null
  );
  const [fileName, setFileName] = useState<string>('');

  // Active analysis result
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(initialInspection);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hoveredAnomalyIndex, setHoveredAnomalyIndex] = useState<number | null>(null);

  // Report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const handleMediaSelected = (base64: string, mime: string, previewUrl: string, name: string) => {
    setSelectedBase64(base64);
    setSelectedMimeType(mime);
    setSelectedPreview(previewUrl);
    setFileName(name);
    setAnalysisError(null);
  };

  const handleClearMedia = () => {
    setSelectedBase64(null);
    setSelectedPreview(null);
    setFileName('');
    setActiveInspection(null);
    setAnalysisError(null);
  };

  const handleRunInspection = async () => {
    if (!selectedBase64) {
      setAnalysisError('Please upload an image or extract a video frame first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const domainToUse = selectedDomain === 'Custom Inspection Profile' && customDomainName.trim()
      ? customDomainName.trim()
      : selectedDomain;

    try {
      const response = await api.runInspection({
        domain: domainToUse,
        imageBase64: selectedBase64,
        mimeType: selectedMimeType,
        threshold,
        customInstructions: customPrompt.trim() || undefined,
      });

      setActiveInspection(response.inspection);
      if (onInspectionCreated) {
        onInspectionCreated(response.inspection);
      }
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setAnalysisError(err.message || 'Vision inspection failed. Please check network connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateInspection = async (
    id: string,
    updates: { status?: InspectionStatus; operator_notes?: string }
  ) => {
    const res = await api.updateInspection(id, updates);
    setActiveInspection(res.inspection);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ScanEye className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Computer Vision Inspection Workspace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest visual frames, select target quality profiles, and trigger Gemini 3.8 Flash multi-modal inference.
          </p>
        </div>

        {activeInspection && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto"
          >
            <span>View Full Audit Certificate</span>
          </button>
        )}
      </div>

      {/* Main Split Layout: Ingestion & Rules on Left, Interactive Canvas & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration & Media Ingestion */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Target Domain Profile Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Target Inspection Domain</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">Active Profile</span>
            </div>

            <div className="space-y-2">
              {DOMAIN_PROFILES.map((profile) => {
                const Icon = profile.icon;
                const isSelected = selectedDomain === profile.name;
                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setSelectedDomain(profile.name);
                      setThreshold(profile.defaultThreshold);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-500/60 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {profile.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{profile.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Domain Input if selected */}
            {selectedDomain === 'Custom Inspection Profile' && (
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Domain Name (e.g. Aerospace Carbon Fiber Composite)"
                  value={customDomainName}
                  onChange={(e) => setCustomDomainName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* 2. Sensitivity Threshold & Custom Directives */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Detection Threshold & Rules</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{threshold}% Confidence</span>
            </div>

            <div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>50% (High Recall / Broad)</span>
                <span>80% (Recommended)</span>
                <span>95% (High Precision / Strict)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Operator Directives / Specific Defect Focus (Optional):
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Prioritize hairline fractures near mounting bolts and check for missing silicone washers..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          {/* 3. Media Ingestion Zone */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Visual Media Ingestion
              </label>
              {fileName && <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{fileName}</span>}
            </div>

            <FileUploadZone
              onMediaSelected={handleMediaSelected}
              selectedPreview={selectedPreview}
              onClear={handleClearMedia}
              domain={selectedDomain}
            />
          </div>

          {/* Trigger Analysis Button */}
          <button
            onClick={handleRunInspection}
            disabled={!selectedBase64 || isAnalyzing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Executing Gemini 3.8 Flash Vision Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run AI Visual Inspection</span>
              </>
            )}
          </button>

          {analysisError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Canvas & Structured AI Output */}
        <div className="lg:col-span-7 space-y-5">
          {selectedPreview ? (
            <div className="space-y-5">
              {/* Interactive Inspection Canvas */}
              <InspectionCanvas
                imageUrl={selectedPreview}
                anomalies={activeInspection?.raw_ai_output.anomaliesDetected || []}
                hoveredIndex={hoveredAnomalyIndex}
                onHoverIndex={setHoveredAnomalyIndex}
                overallStatus={activeInspection?.raw_ai_output.overallStatus}
                isAnalyzing={isAnalyzing}
              />

              {/* Analysis Result Card */}
              {activeInspection ? (
                <ResultCard
                  inspection={activeInspection}
                  onUpdateInspection={handleUpdateInspection}
                  hoveredIndex={hoveredAnomalyIndex}
                  onHoverIndex={setHoveredAnomalyIndex}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              ) : isAnalyzing ? (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">
                    Extracting normalized bounding coordinates (0-1000 scale)...
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Applying domain heuristic filters and compiling actionable operational directives.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
                  Click <span className="text-cyan-400 font-semibold">"Run AI Visual Inspection"</span> above to trigger computer vision analysis.
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border-2 border-dashed border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
                <ScanEye className="w-8 h-8 text-cyan-400/80" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Inspection Canvas Idle</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Upload an image, extract a video frame, or select one of the industry benchmark samples on the left to begin real-time computer vision analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        inspection={activeInspection}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
