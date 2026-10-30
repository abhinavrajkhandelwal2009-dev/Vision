import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Tag,
  Crosshair,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { DetectedAnomaly, AnomalySeverity } from '../server/types.ts';

interface InspectionCanvasProps {
  imageUrl: string;
  anomalies: DetectedAnomaly[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
  overallStatus?: 'PASSED' | 'FAILED' | 'FLAGGED';
  isAnalyzing?: boolean;
}

export const InspectionCanvas: React.FC<InspectionCanvasProps> = ({
  imageUrl,
  anomalies,
  hoveredIndex,
  onHoverIndex,
  overallStatus,
  isAnalyzing = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [tooltipInfo, setTooltipInfo] = useState<{
    anomaly: DetectedAnomaly;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const getSeverityStyle = (severity: AnomalySeverity, isHovered: boolean) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: isHovered ? 'border-rose-400 ring-4 ring-rose-500/40' : 'border-rose-500/90',
          bg: isHovered ? 'bg-rose-500/30' : 'bg-rose-500/15',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-950/90 border-rose-600',
        };
      case 'HIGH':
        return {
          border: isHovered ? 'border-orange-400 ring-4 ring-orange-500/40' : 'border-orange-500/90',
          bg: isHovered ? 'bg-orange-500/30' : 'bg-orange-500/15',
          text: 'text-orange-300',
          badgeBg: 'bg-orange-950/90 border-orange-600',
        };
      case 'MEDIUM':
        return {
          border: isHovered ? 'border-amber-400 ring-4 ring-amber-500/40' : 'border-amber-500/90',
          bg: isHovered ? 'bg-amber-500/30' : 'bg-amber-500/15',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-950/90 border-amber-600',
        };
      case 'LOW':
      default:
        return {
          border: isHovered ? 'border-emerald-400 ring-4 ring-emerald-500/40' : 'border-emerald-500/90',
          bg: isHovered ? 'bg-emerald-500/30' : 'bg-emerald-500/15',
          text: 'text-emerald-300',
          badgeBg: 'bg-emerald-950/90 border-emerald-600',
        };
    }
  };

  const filteredAnomalies = anomalies.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Canvas Bar */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Interactive Visual HUD</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredAnomalies.length} Anomaly Hotspots
          </span>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>

          {/* Toggle Bounding Boxes */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showBoxes
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Bounding Boxes"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showLabels
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Labels"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-300 w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[380px] max-h-[560px] overflow-auto bg-black/60 flex items-center justify-center p-4 select-none"
      >
        <div
          className="relative inline-block transition-transform duration-150 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Image */}
          <img
            src={imageUrl}
            alt="Inspected Visual Frame"
            className="max-h-[500px] w-auto max-w-full rounded-xl object-contain block shadow-2xl"
          />

          {/* Radar Scanning Line Animation while analyzing */}
          {isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />
            </div>
          )}

          {/* Bounding Box Overlays (0-1000 Normalized scale) */}
          {showBoxes &&
            filteredAnomalies.map((anomaly, idx) => {
              if (!anomaly.boundingBox) return null;
              const { ymin, xmin, ymax, xmax } = anomaly.boundingBox;
              const top = (ymin / 1000) * 100;
              const left = (xmin / 1000) * 100;
              const width = ((xmax - xmin) / 1000) * 100;
              const height = ((ymax - ymin) / 1000) * 100;

              const isHovered = hoveredIndex === idx;
              const style = getSeverityStyle(anomaly.severity, isHovered);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    onHoverIndex(idx);
                    setTooltipInfo({ anomaly, x: left + width / 2, y: top });
                  }}
                  onMouseLeave={() => {
                    onHoverIndex(null);
                    setTooltipInfo(null);
                  }}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                  }}
                  className={`absolute border-2 rounded-md transition-all duration-150 cursor-pointer ${style.border} ${style.bg} ${
                    isHovered ? 'z-30 scale-[1.01]' : 'z-10'
                  }`}
                >
                  {/* Corner Crosshairs */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                  {/* Header Label Tag */}
                  {showLabels && (
                    <div
                      className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border whitespace-nowrap shadow-lg flex items-center space-x-1 ${style.badgeBg} ${style.text}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{anomaly.severity}</span>
                      <span className="opacity-70">#{idx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Floating Tooltip when hovering a bounding box */}
          {tooltipInfo && (
            <div
              style={{
                top: `${Math.max(tooltipInfo.y - 12, 5)}%`,
                left: `${Math.min(Math.max(tooltipInfo.x, 15), 85)}%`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute z-50 pointer-events-none w-64 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl backdrop-blur-md text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{tooltipInfo.anomaly.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                  {tooltipInfo.anomaly.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {tooltipInfo.anomaly.description}
              </p>
              {tooltipInfo.anomaly.boundingBox && (
                <div className="text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                  <span>Coordinates (0-1000):</span>
                  <span>[{tooltipInfo.anomaly.boundingBox.ymin}, {tooltipInfo.anomaly.boundingBox.xmin}, {tooltipInfo.anomaly.boundingBox.ymax}, {tooltipInfo.anomaly.boundingBox.xmax}]</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <span>Grid: 1000x1000 Normalized Tensor Space</span>
          <span>•</span>
          <span>Hover bounding box or list card to sync highlight</span>
        </div>
        {overallStatus && (
          <div className="flex items-center space-x-1.5 font-bold text-xs">
            {overallStatus === 'PASSED' && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VERDICT: PASSED</span>
              </span>
            )}
            {overallStatus === 'FAILED' && (
              <span className="text-rose-400 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>VERDICT: FAILED (DEFECTS DETECTED)</span>
              </span>
            )}
            {overallStatus === 'FLAGGED' && (
              <span className="text-amber-400 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>VERDICT: FLAGGED FOR REVIEW</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
