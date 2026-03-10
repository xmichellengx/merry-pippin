"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  X,
  Camera,
} from "lucide-react";
import NextImage from "next/image";
import { format } from "date-fns";
import { addLitterBoxLog, updateLitterBoxLog, deleteLitterBoxLog } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { compressImage, compressImageToBlob } from "@/lib/compress-image";
import type { LitterBoxLog } from "@/lib/supabase";
import Modal from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// --- Photo helpers ---

async function uploadHealthPhoto(file: File): Promise<string> {
  const fileName = `health-${Date.now()}.jpg`;
  const compressed = await compressImageToBlob(file, 800, 0.7);
  const { error } = await supabase.storage.from("photos").upload(fileName, compressed, { contentType: "image/jpeg" });
  if (!error) {
    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(fileName);
    return publicUrl;
  }
  return compressImage(file, 800, 0.7);
}

function PhotoUpload({
  photoUrl,
  onUpload,
  label,
}: {
  photoUrl: string;
  onUpload: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadHealthPhoto(file);
      onUpload(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[11px] text-muted block mb-1">
        <Camera size={10} className="inline mr-0.5" />
        {label || "Photo (vaccine sticker / label)"}
      </label>
      {photoUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Record photo" className="w-full max-w-[200px] h-auto rounded-lg border border-card-border" />
          <button
            type="button"
            onClick={() => onUpload("")}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            aria-label="Remove photo"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-golden-200 text-golden-600 text-xs font-medium hover:border-golden-400 hover:bg-golden-50 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {uploading ? "Uploading..." : "Upload photo"}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function parseLitterPhotos(photoUrl: string | null): string[] {
  if (!photoUrl) return [];
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  return [photoUrl];
}

// --- LitterBoxSection ---

interface LitterBoxSectionProps {
  litterLogs: LitterBoxLog[];
  isAdmin: boolean;
  onLogsChanged: () => void;
}

export default function LitterBoxSection({ litterLogs, isAdmin, onLogsChanged }: LitterBoxSectionProps) {
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [litterPhotos, setLitterPhotos] = useState<string[]>([]);
  const [litterNotes, setLitterNotes] = useState("");
  const [litterSaving, setLitterSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleLitterSave = async () => {
    if (litterPhotos.length === 0 && !litterNotes) return;
    setLitterSaving(true);
    try {
      const now = new Date();
      const photoUrlValue = litterPhotos.length > 0 ? JSON.stringify(litterPhotos) : undefined;
      const log = await addLitterBoxLog({
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm"),
        ...(photoUrlValue ? { photo_url: photoUrlValue } : {}),
        ...(litterNotes ? { notes: litterNotes } : {}),
      });
      setShowLitterForm(false);
      const savedPhotos = [...litterPhotos];
      const savedNotes = litterNotes;
      setLitterPhotos([]);
      setLitterNotes("");
      onLogsChanged();
      // Auto-analyze if photos were uploaded
      if (savedPhotos.length > 0 && log?.id) {
        handleLitterAnalyze(log.id, savedPhotos, savedNotes);
      }
    } finally {
      setLitterSaving(false);
    }
  };

  const handleLitterAnalyze = async (id: string, photos: string | string[], notes: string) => {
    setAnalyzingId(id);
    setAnalysisError(null);
    let photoUrls = Array.isArray(photos) ? photos : parseLitterPhotos(photos);
    // Limit to first photo for analysis to avoid request size issues with data URLs
    if (photoUrls.length > 1 && photoUrls.some(u => u.startsWith("data:"))) {
      photoUrls = [photoUrls[0]];
    }
    try {
      const res = await fetch("/api/analyze-litter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls, notes }),
      });
      const data = await res.json();
      if (data.analysis) {
        const lower = data.analysis.toLowerCase();
        const isAlarming = ["concern", "alarming", "vet", "blood", "parasit", "worm", "diarrhea", "urgent", "abnormal", "warning", "immediate"].some(w => lower.includes(w));
        await updateLitterBoxLog(id, {
          ai_analysis: data.analysis,
          ...(!isAlarming ? { photo_url: null } : {}),
        });
        onLogsChanged();
      } else if (data.error) {
        setAnalysisError(data.error);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("Analysis failed. Please try again.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleLitterDelete = async (id: string) => {
    await deleteLitterBoxLog(id);
    setDeleteTarget(null);
    onLogsChanged();
  };

  // Auto-cleanup: remove photos older than 48h that aren't alarming
  // Called once on mount via parent's loadData, but we expose it here in case needed
  const cleanupOldLitterPhotos = useCallback(async (logs: LitterBoxLog[]) => {
    const TWO_DAYS = 48 * 60 * 60 * 1000;
    for (const log of logs) {
      if (!log.photo_url || !log.created_at) continue;
      const age = Date.now() - new Date(log.created_at).getTime();
      if (age > TWO_DAYS) {
        const lower = (log.ai_analysis || "").toLowerCase();
        const isAlarming = ["concern", "alarming", "vet", "blood", "parasit", "worm", "diarrhea", "urgent", "abnormal", "warning", "immediate"].some(w => lower.includes(w));
        if (!isAlarming) {
          await updateLitterBoxLog(log.id, { photo_url: null });
        }
      }
    }
  }, []);

  // Run cleanup on mount
  useEffect(() => {
    cleanupOldLitterPhotos(litterLogs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚽</span>
            <h2 className="font-semibold text-sm">Litter Box Log</h2>
          </div>
          {isAdmin && (
            <button onClick={() => setShowLitterForm(true)} className="w-8 h-8 rounded-full golden-gradient flex items-center justify-center shadow-md">
              <Plus size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Add Litter Log Form — now uses Modal */}
        <Modal position="bottom" open={showLitterForm} onClose={() => setShowLitterForm(false)} title="Log Litter Box Scoop">
          <div>
            <label className="text-[11px] text-muted block mb-1">
              <Camera size={10} className="inline mr-0.5" />
              Photos of litter box contents
            </label>
            {litterPhotos.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {litterPhotos.map((url, i) => (
                  <div key={i} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-card-border" />
                    <button type="button" onClick={() => setLitterPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <PhotoUpload photoUrl="" onUpload={(url) => { if (url) setLitterPhotos(prev => [...prev, url]); }} label="Add photo" />
          </div>

          <div>
            <label className="text-[11px] text-muted block mb-1">Notes (optional)</label>
            <textarea value={litterNotes} onChange={e => setLitterNotes(e.target.value)}
              placeholder="Anything unusual? Color, smell, consistency..."
              className="w-full px-3 py-2 rounded-lg border border-card-border text-sm resize-none" rows={3} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowLitterForm(false)} className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-medium">Cancel</button>
            <button onClick={handleLitterSave} disabled={litterSaving || (litterPhotos.length === 0 && !litterNotes)}
              className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-medium shadow-md disabled:opacity-50">
              {litterSaving ? "Saving..." : "Save & Analyze"}
            </button>
          </div>
        </Modal>

        {/* Litter Log Cards */}
        <div className="space-y-2">
          {litterLogs.length === 0 ? (
            <div className="card p-6 text-center">
              <NextImage src="/loading-grooming.webp" alt="No logs" width={80} height={75} className="mx-auto mb-1 opacity-60" />
              <p className="text-muted text-xs">&quot;One does not simply skip the scoop.&quot; No litter logs yet!</p>
            </div>
          ) : (
            litterLogs.slice(0, 10).map(log => (
              <div key={log.id} className="card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🚽</span>
                    <span className="text-xs font-medium">{format(new Date(log.date), "MMM d, yyyy")}</span>
                    {log.time && <span className="text-xs text-muted">{log.time}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {log.photo_url && !log.ai_analysis && (
                      <button onClick={() => handleLitterAnalyze(log.id, log.photo_url!, log.notes || "")}
                        disabled={analyzingId === log.id}
                        className="px-2 py-1 rounded-lg bg-golden-50 text-golden-600 text-[10px] font-medium">
                        {analyzingId === log.id ? "Analyzing..." : "Analyze"}
                      </button>
                    )}
                    {analysisError && analyzingId === null && (
                      <span className="text-[10px] text-red-500">{analysisError}</span>
                    )}
                    {isAdmin && (
                      <button onClick={() => setDeleteTarget(log.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {log.photo_url && (
                  <div className="flex gap-2 flex-wrap">
                    {parseLitterPhotos(log.photo_url).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt={`Litter box ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-card-border" />
                    ))}
                  </div>
                )}

                {log.notes && <p className="text-xs text-foreground/70">{log.notes}</p>}

                {analyzingId === log.id && (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 size={12} className="animate-spin text-golden-500" />
                    <span className="text-[10px] text-muted">AI analyzing photo...</span>
                  </div>
                )}

                {log.ai_analysis && (
                  <div className="bg-golden-50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-semibold text-golden-700">AI Analysis</span>
                    </div>
                    {log.ai_analysis.split("\n").filter(l => l.trim()).map((line, i) => (
                      <p key={i} className="text-[11px] text-foreground/80 leading-relaxed">{line.replace(/^[-•*]\s*/, "")}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm dialog for litter log deletion */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete litter log"
        message="Are you sure you want to delete this litter box log?"
        onConfirm={() => deleteTarget && handleLitterDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
