import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Cloud,
  HardDrive,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { StorageStatus } from '../types.ts';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  getAuthHeader: () => Record<string, string>;
  onError?: (msg: string) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  getAuthHeader,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  useEffect(() => {
    // Fetch storage provider info from server
    fetch('/api/storage/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StorageStatus | null) => {
        if (data) setStorageStatus(data);
      })
      .catch(() => {
        // Silently keep default
      });
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      const err = 'Please select a valid image file (JPG, PNG, or WEBP)';
      setUploadError(err);
      onError?.(err);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      const err = 'Photo size must be less than 25MB';
      setUploadError(err);
      onError?.(err);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Upload to server (proxies to Cloudinary if configured, otherwise disk)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      });

      if (!res.ok) {
        // Fallback directly to base64 if upload endpoint fails
        onChange(base64);
        return;
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        onChange(base64);
      }
    } catch (err: any) {
      // If server upload fails, fallback to local data URL so the user still has their picture!
      try {
        const fallbackBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        onChange(fallbackBase64);
      } catch {
        const msg = err.message || 'Failed to upload photo';
        setUploadError(msg);
        onError?.(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setShowUrlInput(false);
      setUrlDraft('');
    }
  };

  // Determine current image storage type
  const isCloudinary = value.includes('cloudinary.com') || value.includes('res.cloudinary');
  const isLocalStorage = value.startsWith('/uploads/');
  const isDataUrl = value.startsWith('data:image/');

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Storage Backend Banner */}
      <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.08)]">
        <div className="flex items-center gap-2">
          {storageStatus?.cloudinaryConfigured ? (
            <>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 text-sky-400">
                <Cloud className="w-3 h-3" />
              </span>
              <span className="text-[#f5ece2]">
                <strong className="text-sky-400 font-medium">Cloudinary CDN Active:</strong> Uploaded images stored securely in the cloud.
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300">
                <HardDrive className="w-3 h-3" />
              </span>
              <span className="text-[#b8a89d]">
                <strong className="text-amber-300 font-medium">Server Storage:</strong> Saved to local disk (<code className="text-white text-[10px]">/uploads</code>). Cloudinary supported in <code className="text-white text-[10px]">.env</code>.
              </span>
            </>
          )}
        </div>

        {storageStatus?.cloudinaryConfigured && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Cloud Protected
          </span>
        )}
      </div>

      {/* When a picture is loaded */}
      {value ? (
        <div className="p-3 bg-[#1f1a15] rounded-2xl border border-[rgba(245,236,226,0.15)] space-y-3">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0e0c0b] border border-[rgba(245,236,226,0.1)] shrink-0 shadow-inner">
              <img
                src={value}
                alt="Package Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
                }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[10px] text-white">
                  <RefreshCw className="w-5 h-5 text-[#e2417e] animate-spin mb-1" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Photo attached</span>
                </div>

                {/* Storage Location Badge */}
                {isCloudinary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <Cloud className="w-2.5 h-2.5" />
                    Cloudinary CDN
                  </span>
                )}
                {isLocalStorage && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <HardDrive className="w-2.5 h-2.5" />
                    Server Disk
                  </span>
                )}
                {isDataUrl && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Embedded
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#b8a89d] line-clamp-2">
                {isCloudinary
                  ? 'Hosted on Cloudinary CDN for instant loading and safe cloud storage.'
                  : 'Image is linked and will be displayed across catalogue cards and WhatsApp order links.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#e2417e] hover:bg-[#c92e6c] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Processing...' : 'Change Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e0c0b] hover:bg-red-950/40 text-xs text-[#b8a89d] hover:text-red-400 border border-[rgba(245,236,226,0.08)] hover:border-red-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Trigger when no picture is set */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
            dragActive
              ? 'border-[#e2417e] bg-[#e2417e]/10 scale-[1.01]'
              : 'border-[rgba(245,236,226,0.2)] hover:border-[#e2417e]/60 bg-[#1f1a15]/70 hover:bg-[#1f1a15]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.1)] flex items-center justify-center text-[#e2417e] mb-3 shadow-md">
            {uploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#e2417e]" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <p className="font-medium text-sm text-[#f5ece2]">
            {uploading ? 'Uploading your picture...' : 'Click to upload your package picture'}
          </p>
          <p className="text-xs text-[#b8a89d] mt-1">
            or drag and drop your photo from your phone or computer
          </p>
          <p className="text-[10px] text-[#b8a89d]/60 mt-1.5 flex items-center gap-1.5">
            <span>PNG, JPG, WEBP</span>
            <span>•</span>
            <span>{storageStatus?.cloudinaryConfigured ? 'Direct Cloudinary Upload' : 'Auto-stored on server'}</span>
          </p>
        </div>
      )}

      {/* Error Banner if any */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Alternate option: Paste web link */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] text-[#b8a89d] hover:text-[#e2417e] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Or paste an online photo link instead</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.1)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#b8a89d]">
              <span>Paste Image URL:</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="text-[11px] text-[#b8a89d] hover:text-[#f5ece2] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0e0c0b] border border-[rgba(245,236,226,0.15)] text-xs text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 rounded-lg bg-[#e2417e] hover:bg-[#c92e6c] text-white text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
