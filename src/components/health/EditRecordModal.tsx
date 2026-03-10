"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Syringe,
  Bug,
  Stethoscope,
  Pill,
  Loader2,
  MapPin,
  Navigation,
  Star,
  X,
  Camera,
} from "lucide-react";
import Modal from "@/components/Modal";
import type { Cat, HealthRecord } from "@/lib/supabase";
import { updateHealthRecord } from "@/lib/data";

const typeConfig: Record<string, { icon: typeof Syringe; color: string; bg: string; label: string }> = {
  vaccine: { icon: Syringe, color: "text-blue-600", bg: "bg-blue-50", label: "Vaccine" },
  deworm: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50", label: "Deworm" },
  vet_visit: { icon: Stethoscope, color: "text-green-600", bg: "bg-green-50", label: "Vet Visit" },
  medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50", label: "Medication" },
  other: { icon: Stethoscope, color: "text-gray-600", bg: "bg-gray-50", label: "Other" },
};

// --- PhotoUpload (inline, used only here and in add form) ---
import { supabase } from "@/lib/supabase";
import { compressImage, compressImageToBlob } from "@/lib/compress-image";

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

// --- NearbyVet type ---
type NearbyVet = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  totalRatings: number;
  placeId: string;
  openNow: boolean | null;
  mapsUrl: string;
  isOpen: boolean;
};

// --- VetSelector ---
export function VetSelector({
  selectedVet,
  onSelect,
}: {
  selectedVet: string;
  onSelect: (name: string, mapsUrl?: string) => void;
}) {
  const [nearbyVets, setNearbyVets] = useState<NearbyVet[]>([]);
  const [searchResults, setSearchResults] = useState<NearbyVet[]>([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [vetError, setVetError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [customVet, setCustomVet] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const findNearbyVets = useCallback(async () => {
    setLoadingVets(true);
    setVetError("");
    setShowResults(false);

    if (!navigator.geolocation) {
      setVetError("Geolocation is not supported by your browser.");
      setLoadingVets(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `/api/nearby-vets?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          );
          const data = await res.json();
          if (!res.ok) {
            setVetError(data.error || "Failed to find nearby vets");
          } else {
            setNearbyVets(data.vets || []);
            setShowResults(true);
          }
        } catch {
          setVetError("Failed to fetch nearby vets");
        } finally {
          setLoadingVets(false);
        }
      },
      (err) => {
        setVetError(
          err.code === 1
            ? "Location access denied. Please enable location in your browser settings."
            : "Could not get your location. Please try again."
        );
        setLoadingVets(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const searchVets = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-vets?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.vets || []);
        }
      } catch {
        // silently fail, user can still type manually
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  }, []);

  if (selectedVet && !manualEntry) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-golden-50 border border-golden-200">
        <MapPin size={14} className="text-golden-500 shrink-0" />
        <span className="text-xs font-medium text-golden-700 flex-1">{selectedVet}</span>
        <button
          type="button"
          onClick={() => onSelect("")}
          className="text-muted hover:text-foreground"
          aria-label="Clear vet selection"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={findNearbyVets}
          disabled={loadingVets}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-golden-50 text-golden-700 text-xs font-medium hover:bg-golden-100 transition-colors disabled:opacity-50"
        >
          {loadingVets ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
          {loadingVets ? "Finding vets..." : "Find Nearby Vets"}
        </button>
        <button
          type="button"
          onClick={() => setManualEntry(!manualEntry)}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          Type manually
        </button>
      </div>

      {vetError && <p className="text-xs text-red-500">{vetError}</p>}

      {manualEntry && (
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Start typing vet clinic name..."
              value={customVet}
              onChange={(e) => {
                setCustomVet(e.target.value);
                searchVets(e.target.value);
              }}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                if (customVet.trim()) {
                  onSelect(customVet.trim());
                  setManualEntry(false);
                  setCustomVet("");
                  setSearchResults([]);
                }
              }}
              className="px-3 py-2 rounded-lg golden-gradient text-white text-xs font-medium"
            >
              Add
            </button>
          </div>
          {loadingSearch && (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <Loader2 size={11} className="animate-spin text-golden-500" />
              <span className="text-[11px] text-muted">Searching clinics...</span>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-card-border bg-white">
              {searchResults.map((vet) => (
                <button
                  key={vet.placeId}
                  type="button"
                  onClick={() => {
                    onSelect(vet.name, vet.mapsUrl);
                    setManualEntry(false);
                    setCustomVet("");
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-golden-50 border-b border-card-border last:border-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block">{vet.name}</span>
                      <span className="text-[11px] text-muted block mt-0.5">{vet.address}</span>
                    </div>
                    <div className="text-right shrink-0">
                      {vet.rating !== null && (
                        <span className="flex items-center gap-0.5 text-[11px] text-amber-600">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {vet.rating}
                        </span>
                      )}
                      {vet.openNow !== null && (
                        <span className={`text-[10px] font-medium ${vet.openNow ? "text-green-600" : "text-red-500"}`}>
                          {vet.openNow ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-card-border bg-white">
          {nearbyVets.length === 0 ? (
            <p className="p-3 text-xs text-muted text-center">No vet clinics found nearby.</p>
          ) : (
            nearbyVets.map((vet) => (
              <button
                key={vet.placeId}
                type="button"
                onClick={() => {
                  onSelect(vet.name, vet.mapsUrl);
                  setShowResults(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-golden-50 border-b border-card-border last:border-0 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block">{vet.name}</span>
                    <span className="text-[11px] text-muted block mt-0.5">{vet.address}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {vet.rating !== null && (
                      <span className="flex items-center gap-0.5 text-[11px] text-amber-600">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {vet.rating} <span className="text-muted">({vet.totalRatings})</span>
                      </span>
                    )}
                    {vet.openNow !== null && (
                      <span className={`text-[10px] font-medium ${vet.openNow ? "text-green-600" : "text-red-500"}`}>
                        {vet.openNow ? "Open now" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- EditRecordModal ---
interface EditRecordModalProps {
  record: HealthRecord;
  cats: Cat[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditRecordModal({ record, cats, onClose, onSaved }: EditRecordModalProps) {
  const [title, setTitle] = useState(record.title);
  const [date, setDate] = useState(record.date);
  const [dueDate, setDueDate] = useState(record.next_due_date ?? "");
  const [notes, setNotes] = useState(record.description ?? "");
  const [vetName, setVetName] = useState(record.vet_name ?? "");
  const [recordType, setRecordType] = useState<string>(record.record_type);
  const [photoUrl, setPhotoUrl] = useState(record.photo_url ?? "");
  const [saving, setSaving] = useState(false);

  const catName = cats.find(c => c.id === record.cat_id)?.name ?? "Unknown";
  const showPhoto = recordType === "vaccine" || recordType === "deworm";

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    try {
      await updateHealthRecord(record.id, {
        title,
        date,
        record_type: recordType,
        next_due_date: dueDate || null,
        description: notes || null,
        vet_name: vetName || null,
        photo_url: photoUrl || null,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Edit Record">
      <p className="text-xs text-muted">Cat: <span className="font-medium text-foreground">{catName}</span></p>

      <div>
        <label htmlFor="edit-record-type" className="text-xs text-muted block mb-1">Type</label>
        <select id="edit-record-type" value={recordType} onChange={e => setRecordType(e.target.value)}>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="edit-record-title-input" className="text-xs text-muted block mb-1">Title</label>
        <input id="edit-record-title-input" type="text" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label htmlFor="edit-record-date" className="text-xs text-muted block mb-1">Date</label>
        <input id="edit-record-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="edit-record-due-date" className="text-xs text-muted block mb-1">Next Due Date</label>
        <input id="edit-record-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="edit-record-vet" className="text-xs text-muted block mb-1">Vet Clinic</label>
        <VetSelector
          selectedVet={vetName}
          onSelect={(name) => setVetName(name)}
        />
      </div>
      <div>
        <label htmlFor="edit-record-notes" className="text-xs text-muted block mb-1">Notes</label>
        <textarea id="edit-record-notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {showPhoto && (
        <PhotoUpload
          photoUrl={photoUrl}
          onUpload={setPhotoUrl}
          label={recordType === "vaccine" ? "Vaccine sticker / label photo" : "Deworm product photo"}
        />
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !title}
          className="flex-1 py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={onClose} className="px-5 py-3 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
