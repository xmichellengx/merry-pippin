"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Syringe,
  Bug,
  Stethoscope,
  Pill,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  MapPin,
  ExternalLink,
  Navigation,
  Star,
  X,
  Check,
  Pencil,
  Camera,
  ImageIcon,
  ChevronDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { format, differenceInDays } from "date-fns";
import { getCats, getHealthRecords, addHealthRecords, updateHealthRecord, deleteHealthRecord, getLitterBoxLogs, addLitterBoxLog, updateLitterBoxLog, deleteLitterBoxLog } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { compressImage, compressImageToBlob } from "@/lib/compress-image";
import type { Cat, HealthRecord, LitterBoxLog } from "@/lib/supabase";
import { TwoCatsSitting } from "@/components/CatIllustrations";
import { useAdmin } from "@/components/AdminContext";
import { AiInsights } from "@/components/AiInsights";

const typeConfig: Record<string, { icon: typeof Syringe; color: string; bg: string; label: string }> = {
  vaccine: { icon: Syringe, color: "text-blue-600", bg: "bg-blue-50", label: "Vaccine" },
  deworm: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50", label: "Deworm" },
  vet_visit: { icon: Stethoscope, color: "text-green-600", bg: "bg-green-50", label: "Vet Visit" },
  medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50", label: "Medication" },
  other: { icon: Stethoscope, color: "text-gray-600", bg: "bg-gray-50", label: "Other" },
};

const vaccineBrands = [
  { value: "", label: "Select vaccine brand..." },
  { value: "Purevax 3-in-1 (FVRCP)", label: "Purevax 3-in-1 FVRCP — Boehringer Ingelheim" },
  { value: "Purevax 4-in-1 (FVRCP + FeLV)", label: "Purevax 4-in-1 FVRCP + FeLV — Boehringer Ingelheim" },
  { value: "Felocell 3 (FVRCP)", label: "Felocell 3 FVRCP — Zoetis" },
  { value: "Felocell 4 (FVRCP + FeLV)", label: "Felocell 4 FVRCP + FeLV — Zoetis" },
  { value: "Nobivac Tricat (FVRCP)", label: "Nobivac Tricat HCPCH 3-in-1 — MSD Animal Health" },
  { value: "Rabisin (Rabies)", label: "Rabisin Rabies — Boehringer Ingelheim" },
  { value: "Leukocell 2 (FeLV)", label: "Leukocell 2 FeLV — Zoetis" },
  { value: "Other vaccine", label: "Other (type manually)" },
];

const dewormBrands = [
  { value: "", label: "Select deworm brand..." },
  { value: "Drontal", label: "Drontal — Elanco (tablet)" },
  { value: "Milbemax", label: "Milbemax — Elanco (tablet)" },
  { value: "Broadline", label: "Broadline — Boehringer Ingelheim (spot-on)" },
  { value: "Revolution Plus", label: "Revolution Plus — Zoetis (spot-on)" },
  { value: "Advocate", label: "Advocate — Elanco (spot-on)" },
  { value: "Profender", label: "Profender — Elanco (spot-on)" },
  { value: "Panacur", label: "Panacur — MSD (paste/granules)" },
  { value: "Nexgard Combo", label: "Nexgard Combo — Boehringer Ingelheim (spot-on)" },
  { value: "Other deworm", label: "Other (type manually)" },
];

async function uploadHealthPhoto(file: File): Promise<string> {
  const fileName = `health-${Date.now()}.jpg`;
  const compressed = await compressImageToBlob(file, 800, 0.7);

  const { error } = await supabase.storage.from('photos').upload(fileName, compressed, { contentType: 'image/jpeg' });
  if (!error) {
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    return publicUrl;
  }

  // Fallback to compressed data URL if storage not configured
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
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
          )}
          {uploading ? "Uploading..." : "Upload photo"}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

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

function parseLitterPhotos(photoUrl: string | null): string[] {
  if (!photoUrl) return [];
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  return [photoUrl];
}

function VetSelector({
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
          {loadingVets ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Navigation size={13} />
          )}
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

      {vetError && (
        <p className="text-xs text-red-500">{vetError}</p>
      )}

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

function EditRecordModal({
  record,
  cats,
  onClose,
  onSaved,
}: {
  record: HealthRecord;
  cats: Cat[];
  onClose: () => void;
  onSaved: () => void;
}) {
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
    <div className="fixed inset-0 overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Record</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center">
            <X size={16} className="text-muted" />
          </button>
        </div>

        <p className="text-xs text-muted">Cat: <span className="font-medium text-foreground">{catName}</span></p>

        <div>
          <label className="text-xs text-muted block mb-1">Type</label>
          <select value={recordType} onChange={e => setRecordType(e.target.value)}>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Next Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Vet Clinic</label>
          <VetSelector
            selectedVet={vetName}
            onSelect={(name) => setVetName(name)}
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Notes</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
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
      </div>
    </div>
  );
}

function RecordCard({
  record,
  cats,
  onDelete,
  onEdit,
  onMarkDone,
  isAdmin,
}: {
  record: HealthRecord;
  cats: Cat[];
  onDelete: (id: string) => void;
  onEdit: (record: HealthRecord) => void;
  onMarkDone: (record: HealthRecord) => void;
  isAdmin: boolean;
}) {
  const config = typeConfig[record.record_type] ?? typeConfig.other;
  const Icon = config.icon;
  const dueIn = record.next_due_date
    ? differenceInDays(new Date(record.next_due_date), new Date())
    : null;
  const isOverdue = dueIn !== null && dueIn < 0;
  const isDueSoon = dueIn !== null && dueIn >= 0 && dueIn <= 30;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm">{record.title}</h3>
              <span className="text-[10px] text-muted">{format(new Date(record.date), "MMM d, yyyy")}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(record)}
                  className="w-7 h-7 rounded-lg bg-golden-50 flex items-center justify-center text-golden-600 hover:bg-golden-100 transition-colors"
                  title="Edit"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
          {record.description && (
            <p className="text-xs text-muted mt-0.5">{record.description}</p>
          )}
          {record.vet_name && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={11} className="text-golden-500 shrink-0" />
              <span className="text-[11px] text-golden-600 font-medium">{record.vet_name}</span>
            </div>
          )}
          {record.photo_url && (
            <div className="mt-2">
              <button
                onClick={() => window.open(record.photo_url!, '_blank')}
                className="group relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.photo_url}
                  alt="Vaccine/deworm label"
                  className="w-full max-w-[180px] h-auto rounded-lg border border-card-border"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                  <ImageIcon size={16} className="text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                </div>
              </button>
            </div>
          )}
          {record.next_due_date && dueIn !== null && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${isOverdue ? "badge-danger" : isDueSoon ? "badge-warning" : "badge-success"}`}>
                {isOverdue
                  ? `Overdue by ${Math.abs(dueIn)} days`
                  : dueIn === 0
                  ? "Due today"
                  : `Due in ${dueIn} days`}
              </span>
              {isAdmin && (isOverdue || isDueSoon) && (
                <button
                  onClick={() => onMarkDone(record)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[11px] font-medium hover:bg-green-100 transition-colors"
                >
                  <Check size={11} />
                  Mark done
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const { isAdmin } = useAdmin();

  // Litter box state
  const [litterLogs, setLitterLogs] = useState<LitterBoxLog[]>([]);
  const litterSectionRef = useRef<HTMLDivElement>(null);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [litterPhotos, setLitterPhotos] = useState<string[]>([]);
  const [litterNotes, setLitterNotes] = useState("");
  const [litterSaving, setLitterSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form state
  const [formCatId, setFormCatId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formNotes, setFormNotes] = useState("");
  const [formVet, setFormVet] = useState("");
  const [formTypes, setFormTypes] = useState<Record<string, { checked: boolean; dueDate: string; brand: string; photo: string }>>({
    vaccine: { checked: false, dueDate: "", brand: "", photo: "" },
    deworm: { checked: false, dueDate: "", brand: "", photo: "" },
    vet_visit: { checked: false, dueDate: "", brand: "", photo: "" },
    medication: { checked: false, dueDate: "", brand: "", photo: "" },
    other: { checked: false, dueDate: "", brand: "", photo: "" },
  });

  const [loadError, setLoadError] = useState(false);

  const loadData = async () => {
    setLoadError(false);
    try {
      let [c, h, l] = await Promise.all([getCats(), getHealthRecords(), getLitterBoxLogs()]);
      // Supabase can silently return [] on transient errors — retry once
      if (h.length === 0) {
        await new Promise(r => setTimeout(r, 500));
        h = await getHealthRecords();
      }
      setCats(c); setRecords(h); setLitterLogs(l);
      cleanupOldLitterPhotos(l);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const checkedTypes = Object.entries(formTypes).filter(([, v]) => v.checked);

  const handleSave = async () => {
    if (!formCatId || !formTitle || checkedTypes.length === 0) return;
    setSaving(true);
    try {
      const newRecords = checkedTypes.map(([type, { dueDate, brand, photo }]) => {
        const brandPrefix = brand && brand !== "Other vaccine" && brand !== "Other deworm" ? `${brand} — ` : "";
        return {
          cat_id: formCatId,
          record_type: type,
          title: brandPrefix ? `${brandPrefix}${formTitle}` : formTitle,
          date: formDate,
          ...(dueDate ? { next_due_date: dueDate } : {}),
          ...(formNotes ? { description: formNotes } : {}),
          ...(formVet ? { vet_name: formVet } : {}),
          ...(photo ? { photo_url: photo } : {}),
        };
      });
      await addHealthRecords(newRecords);
      setShowAddForm(false);
      setFormCatId(""); setFormTitle(""); setFormNotes(""); setFormVet("");
      setFormTypes({
        vaccine: { checked: false, dueDate: "", brand: "", photo: "" },
        deworm: { checked: false, dueDate: "", brand: "", photo: "" },
        vet_visit: { checked: false, dueDate: "", brand: "", photo: "" },
        medication: { checked: false, dueDate: "", brand: "", photo: "" },
        other: { checked: false, dueDate: "", brand: "", photo: "" },
      });
      loadData();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteHealthRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleMarkDone = async (record: HealthRecord) => {
    await updateHealthRecord(record.id, { next_due_date: null });
    loadData();
  };

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
      setLitterPhotos([]);
      setLitterNotes("");
      loadData();
      // Auto-analyze if photos were uploaded
      if (litterPhotos.length > 0 && log?.id) {
        handleLitterAnalyze(log.id, litterPhotos, litterNotes);
      }
    } finally { setLitterSaving(false); }
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
        loadData();
      } else if (data.error) {
        setAnalysisError(data.error);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("Analysis failed. Please try again.");
    } finally { setAnalyzingId(null); }
  };

  // Auto-cleanup: remove photos older than 48h that aren't alarming
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

  const handleLitterDelete = async (id: string) => {
    await deleteLitterBoxLog(id);
    setLitterLogs(prev => prev.filter(l => l.id !== id));
  };

  const healthContext = useMemo(() => {
    if (cats.length === 0 || (records.length === 0 && litterLogs.length === 0)) return "";
    const lines: string[] = [`Today: ${format(new Date(), "yyyy-MM-dd")}`];
    cats.forEach(cat => {
      const catRecords = records.filter(r => r.cat_id === cat.id);
      lines.push(`\n${cat.name} — ${cat.breed}, DOB: ${cat.date_of_birth || "unknown"}`);
      if (catRecords.length > 0) {
        lines.push(`Health records:`);
        catRecords.slice(0, 15).forEach(r => {
          let rec = `- ${r.title} (${r.record_type}) on ${r.date}`;
          if (r.next_due_date) rec += `, next due: ${r.next_due_date}`;
          if (r.vet_name) rec += `, vet: ${r.vet_name}`;
          if (r.description) rec += `, notes: ${r.description}`;
          lines.push(rec);
        });
      }
    });

    // Include litter box analysis data (shared box, not per-cat)
    const analyzedLogs = litterLogs.filter(l => l.ai_analysis);
    if (analyzedLogs.length > 0) {
      lines.push(`\nLitter Box Analysis (shared box, last ${Math.min(analyzedLogs.length, 5)} entries):`);
      analyzedLogs.slice(0, 5).forEach(l => {
        lines.push(`- ${l.date}${l.time ? ` ${l.time}` : ""}: ${l.ai_analysis}${l.notes ? ` [owner note: ${l.notes}]` : ""}`);
      });
    }

    return lines.join("\n");
  }, [cats, records, litterLogs]);

  const filtered = records
    .filter(r => selectedCat === "all" || r.cat_id === selectedCat)
    .filter(r => filterType === "all" || r.record_type === filterType);

  // Split into "needs attention" (overdue/due soon) and past records grouped by month
  const { needsAttention, monthGroups } = useMemo(() => {
    const now = new Date();
    const attention: HealthRecord[] = [];
    const past: HealthRecord[] = [];

    for (const r of filtered) {
      if (r.next_due_date) {
        const dueIn = differenceInDays(new Date(r.next_due_date), now);
        if (dueIn <= 30) {
          attention.push(r);
          continue;
        }
      }
      past.push(r);
    }

    // Sort attention: overdue first (most overdue first), then due soonest
    attention.sort((a, b) => {
      const aDue = differenceInDays(new Date(a.next_due_date!), now);
      const bDue = differenceInDays(new Date(b.next_due_date!), now);
      return aDue - bDue;
    });

    // Group past records by month
    const groups: { key: string; label: string; records: HealthRecord[] }[] = [];
    const groupMap = new Map<string, HealthRecord[]>();
    for (const r of past) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(r);
    }
    // Sort month keys descending (newest first)
    const sortedKeys = [...groupMap.keys()].sort((a, b) => b.localeCompare(a));
    for (const key of sortedKeys) {
      const [y, m] = key.split("-");
      const label = format(new Date(parseInt(y), parseInt(m) - 1), "MMMM yyyy");
      groups.push({ key, label, records: groupMap.get(key)! });
    }

    return { needsAttention: attention, monthGroups: groups };
  }, [filtered]);

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Auto-expand the most recent month when data changes
  const latestMonthKey = monthGroups.length > 0 ? monthGroups[0].key : "";
  useEffect(() => {
    if (latestMonthKey) {
      setExpandedMonths(new Set([latestMonthKey]));
    }
  }, [latestMonthKey]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return <div className="flex flex-col items-center pt-40 gap-3"><TwoCatsSitting size={120} className="opacity-30" /><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Health Records</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md">
            <Plus size={18} className="text-white" />
          </button>
        )}
      </div>

      <AiInsights
        cacheKey="health"
        title="Health Overview"
        loadingText="Reviewing health records..."
        context={healthContext}
        prompt={`You are a vet advisor for Golden British Shorthair Munchkin kittens (Merry & Pippin, sharing one litter box). Analyze their health records AND litter box analysis data, and give 2-4 insights as a dash-separated list.

Focus on what the owner needs to know RIGHT NOW:
- Flag any vaccines or deworm treatments that are overdue or due within the next 2 weeks, with the exact date.
- If they're up to date on everything, confirm that and mention when the next thing is due.
- If litter box analysis data is present, summarize any patterns or concerns (e.g., consistency changes, hydration, anything flagged across multiple entries). Don't just repeat the analysis — synthesize it.
- Note if any record type seems missing (e.g., no deworm record, or no vet visit in a long time).
- Don't list every record back — give a high-level health status.
- Be specific with dates and observations. No vague advice.

Plain text only, no markdown. Jump straight into insights, no intro.`}
      />

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>All</button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "vaccine", "deworm", "vet_visit", "medication"].map(type => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${filterType === type ? "bg-foreground text-white" : "bg-golden-50 text-foreground/70"}`}>
            {type === "all" ? "All Types" : typeConfig[type]?.label ?? type}
          </button>
        ))}
      </div>
      <button onClick={() => litterSectionRef.current?.scrollIntoView({ behavior: "smooth" })} className="w-full py-2 rounded-xl text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        🚽 Jump to Litter Analysis
      </button>

      {isAdmin && showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">New Health Record</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select value={formCatId} onChange={e => setFormCatId(e.target.value)}>
              <option value="" disabled>Select cat...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Title</label>
            <input type="text" placeholder="e.g., Annual Checkup" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
          </div>

          {/* Type checkboxes with per-type due dates */}
          <div>
            <label className="text-xs text-muted block mb-2">What was done? (tick all that apply)</label>
            <div className="space-y-1">
              {Object.entries(formTypes).map(([type, { checked, dueDate, brand, photo }]) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                const brandOptions = type === "vaccine" ? vaccineBrands : type === "deworm" ? dewormBrands : null;
                const showPhotoUpload = type === "vaccine" || type === "deworm";
                return (
                  <div key={type}>
                    <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setFormTypes(prev => ({
                          ...prev,
                          [type]: { ...prev[type], checked: e.target.checked },
                        }))}
                        className="w-4 h-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500 shrink-0"
                      />
                      <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={13} className={config.color} />
                      </div>
                      <span className="text-sm font-medium">{config.label}</span>
                    </label>
                    {checked && (
                      <div className="pl-[1.625rem] ml-2 mt-0.5 mb-1 border-l-2 border-golden-200 space-y-2">
                        {brandOptions && (
                          <div>
                            <label className="text-[11px] text-muted block mb-0.5">Brand</label>
                            <select
                              value={brand}
                              onChange={(e) => setFormTypes(prev => ({
                                ...prev,
                                [type]: { ...prev[type], brand: e.target.value },
                              }))}
                              className="text-xs"
                            >
                              {brandOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="text-[11px] text-muted block mb-0.5">Next due date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setFormTypes(prev => ({
                              ...prev,
                              [type]: { ...prev[type], dueDate: e.target.value },
                            }))}
                            className="text-xs"
                          />
                        </div>
                        {showPhotoUpload && (
                          <PhotoUpload
                            photoUrl={photo}
                            onUpload={(url) => setFormTypes(prev => ({
                              ...prev,
                              [type]: { ...prev[type], photo: url },
                            }))}
                            label={type === "vaccine" ? "Vaccine sticker / label photo" : "Deworm product photo"}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vet Selector - Google Places Nearby Search */}
          <div>
            <label className="text-xs text-muted block mb-1">
              <MapPin size={11} className="inline mr-0.5" />
              Vet Clinic (optional)
            </label>
            <VetSelector
              selectedVet={formVet}
              onSelect={(name) => setFormVet(name)}
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !formCatId || !formTitle || checkedTypes.length === 0} className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
              {saving ? "Saving..." : "Save Record"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          cats={cats}
          onClose={() => setEditingRecord(null)}
          onSaved={loadData}
        />
      )}

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <NextImage src="/cat-face-icon.png" alt="No records" width={110} height={110} className="mx-auto mb-2 opacity-40" />
          <p className="text-muted text-sm">{loadError ? "Failed to load records." : "No records found."}</p>
          {loadError && (
            <button onClick={() => { setLoading(true); loadData(); }} className="mt-3 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md">
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Needs Attention Section */}
          {needsAttention.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={13} className="text-red-500" />
                </div>
                <h2 className="text-sm font-bold text-red-600">Needs Attention</h2>
                <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{needsAttention.length}</span>
              </div>
              <div className="space-y-2">
                {needsAttention.map(record => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    cats={cats}
                    onDelete={handleDelete}
                    onEdit={setEditingRecord}
                    onMarkDone={handleMarkDone}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Records Grouped by Month */}
          {monthGroups.length > 0 && (
            <div>
              {needsAttention.length > 0 && (
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-golden-50 flex items-center justify-center">
                    <Clock size={13} className="text-golden-600" />
                  </div>
                  <h2 className="text-sm font-bold">Past Records</h2>
                </div>
              )}
              <div className="space-y-2">
                {monthGroups.map(group => {
                  const isExpanded = expandedMonths.has(group.key);
                  return (
                    <div key={group.key}>
                      <button
                        onClick={() => toggleMonth(group.key)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-golden-50/70 hover:bg-golden-50 transition-colors"
                      >
                        <span className="text-xs font-semibold text-foreground">{group.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted font-medium">{group.records.length} {group.records.length === 1 ? "record" : "records"}</span>
                          <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="space-y-2 mt-2">
                          {group.records.map(record => (
                            <RecordCard
                              key={record.id}
                              record={record}
                              cats={cats}
                              onDelete={handleDelete}
                              onEdit={setEditingRecord}
                              onMarkDone={handleMarkDone}
                              isAdmin={isAdmin}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Litter Box Log Section */}
      <div className="mt-6" ref={litterSectionRef}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚽</span>
            <h2 className="font-semibold text-sm">Litter Box Log</h2>
          </div>
          {isAdmin && (
            <button onClick={() => setShowLitterForm(!showLitterForm)} className="w-8 h-8 rounded-full golden-gradient flex items-center justify-center shadow-md">
              <Plus size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Add Litter Log Form */}
        {showLitterForm && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center" onClick={() => setShowLitterForm(false)}>
            <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto animate-slide-up"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }} onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-sm">Log Litter Box Scoop</h3>

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
            </div>
          </div>
        )}

        {/* Litter Log Cards */}
        <div className="space-y-2">
          {litterLogs.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-muted text-xs">No litter box logs yet. Tap + to log a scoop.</p>
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
                      <button onClick={() => handleLitterDelete(log.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50">
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
    </div>
  );
}
