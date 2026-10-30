import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Video,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Camera
} from 'lucide-react';

interface FileUploadZoneProps {
  onMediaSelected: (base64Data: string, mimeType: string, previewUrl: string, fileName: string) => void;
  selectedPreview: string | null;
  onClear: () => void;
  domain: string;
}

const SAMPLE_ASSETS = [
  {
    id: 'turbine',
    domain: 'Industrial Manufacturing',
    title: 'Turbine Casing Defect',
    desc: 'High-stress alloy with crack propagation',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg'
  },
  {
    id: 'safety',
    domain: 'Infrastructure & Safety',
    title: 'Construction PPE Audit',
    desc: 'High-risk zone safety gear compliance',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg'
  },
  {
    id: 'retail',
    domain: 'Retail & Inventory',
    title: 'Retail Shelf Stock Void',
    desc: 'Out-of-stock planogram facing audit',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg'
  },
  {
    id: 'circuit',
    domain: 'Industrial Manufacturing',
    title: 'PCB Solder Quality',
    desc: 'SMT solder bridging & component alignment',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg'
  }
];

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onMediaSelected,
  selectedPreview,
  onClear,
  domain,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setUploadError(null);

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File exceeds maximum 20MB limit. Please provide an optimized asset.');
      return;
    }

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setUploadError('Unsupported format. Please upload JPG, PNG, WEBP, or MP4/WEBM video.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onMediaSelected(base64, file.type, base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Video frame extraction
  const captureVideoFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onMediaSelected(dataUrl, 'image/jpeg', dataUrl, `video_frame_${Math.round(video.currentTime * 10) / 10}s.jpg`);
      setVideoFile(null);
    }
  };

  // Sample load helper
  const handleSelectSample = async (sample: typeof SAMPLE_ASSETS[0]) => {
    try {
      setUploadError(null);
      // Fetch image and convert to data URL for seamless offline/online inspection
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onMediaSelected(base64, sample.mimeType, sample.url, `${sample.title}.jpg`);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // Fallback direct url
      onMediaSelected(sample.url, sample.mimeType, sample.url, `${sample.title}.jpg`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Frame Extractor Modal/Drawer if a video is dropped */}
      {videoFile && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-800/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Video className="w-4 h-4" />
              <span>Video Frame Ingestion & Scrubber</span>
            </div>
            <button
              onClick={() => setVideoFile(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <video
            ref={videoRef}
            src={videoFile}
            className="w-full max-h-72 object-contain rounded-xl bg-black border border-slate-800"
            onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setVideoCurrentTime(e.currentTarget.currentTime)}
            controls
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-slate-400">
              Timestamp: {videoCurrentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
            </span>
            <button
              onClick={captureVideoFrame}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Extract Frame for AI Inspection</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Drag-Drop Box */}
      {!selectedPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your inspection asset or <span className="text-cyan-400 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports High-Res JPG, PNG, WEBP (up to 20MB) or MP4 video clips
              </p>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">
              <span>Domain Context:</span>
              <span className="text-cyan-300 font-semibold">{domain}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/60 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <img
              src={selectedPreview}
              alt="Uploaded Preview"
              className="w-16 h-16 rounded-xl object-cover border border-slate-800 shadow-md shrink-0"
            />
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Asset Loaded & Verified</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">Ready for Gemini multi-modal tensor analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Change Image</span>
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {uploadError && (
        <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/50 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Quick sample assets for instant verification */}
      <div>
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-2">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Or test with benchmark industry samples:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_ASSETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden mb-1.5 bg-slate-950">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300">
                  {sample.domain.split(' ')[0]}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                {sample.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{sample.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
