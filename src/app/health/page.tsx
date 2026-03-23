"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Syringe,
  Bug,
  Stethoscope,
  Pill,
  Trash2,
  MapPin,
  ImageIcon,
  ChevronDown,
  AlertTriangle,
  Clock,
  Check,
  Pencil,
  Camera,
  Loader2,
  X,
} from "lucide-react";
import NextImage from "next/image";
import { format, differenceInDays } from "date-fns";
import { getHealthRecords, addHealthRecords, deleteHealthRecord, updateHealthRecord, getLitterBoxLogs } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { compressImage, compressImageToBlob } from "@/lib/compress-image";
import type { HealthRecord, LitterBoxLog } from "@/lib/supabase";
import { useAdmin } from "@/components/AdminContext";
import { AiInsights } from "@/components/AiInsights";

import { FilterChip, FilterChipDark } from "@/components/FilterChip";
import { PageHeader } from "@/components/PageHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCats } from "@/hooks/useCats";
import EditRecordModal, { VetSelector } from "@/components/health/EditRecordModal";
import LitterBoxSection from "@/components/health/LitterBoxSection";

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

function RecordCard({
  record,
  onDelete,
  onEdit,
  onMarkDone,
  isAdmin,
}: {
  record: HealthRecord;
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
                  className="w-8 h-8 rounded-lg bg-golden-50 flex items-center justify-center text-golden-600 hover:bg-golden-100 transition-colors"
                  title="Edit"
                  aria-label="Edit record"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                  title="Delete"
                  aria-label="Delete record"
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
  const { cats } = useCats();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  // Litter box state
  const [litterLogs, setLitterLogs] = useState<LitterBoxLog[]>([]);
  const litterSectionRef = useRef<HTMLDivElement>(null);

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
      let [h, l] = await Promise.all([getHealthRecords(), getLitterBoxLogs()]);  // eslint-disable-line prefer-const
      // Supabase can silently return [] on transient errors — retry once
      if (h.length === 0) {
        await new Promise(r => setTimeout(r, 500));
        h = await getHealthRecords();
      }
      setRecords(h); setLitterLogs(l);
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
    setDeleteTarget(null);
  };

  const handleMarkDone = async (record: HealthRecord) => {
    await updateHealthRecord(record.id, { next_due_date: null });
    loadData();
  };

  const healthContext = useMemo(() => {
    if (cats.length === 0 || (records.length === 0 && litterLogs.length === 0)) return "";
    const lines: string[] = [];
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
    return <LoadingScreen image="/loading-health.webp" />;
  }

  return (
    <div className="px-4 pt-12 pb-6 space-y-4">
      <PageHeader
        title="Health Records"
        action={isAdmin ? <ActionButton onClick={() => setShowAddForm(!showAddForm)} label="Add health record" /> : undefined}
      />

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
        <FilterChip active={selectedCat === "all"} onClick={() => setSelectedCat("all")}>All</FilterChip>
        {cats.map(cat => (
          <FilterChip key={cat.id} active={selectedCat === cat.id} onClick={() => setSelectedCat(cat.id)}>{cat.name}</FilterChip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "vaccine", "deworm", "vet_visit", "medication"].map(type => (
          <FilterChipDark key={type} active={filterType === type} onClick={() => setFilterType(type)}>
            {type === "all" ? "All Types" : typeConfig[type]?.label ?? type}
          </FilterChipDark>
        ))}
      </div>
      <button onClick={() => litterSectionRef.current?.scrollIntoView({ behavior: "smooth" })} className="w-full py-2 rounded-xl text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        🚽 Jump to Litter Analysis
      </button>

      {isAdmin && showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">New Health Record</h3>
          <div>
            <label htmlFor="health-cat" className="text-xs text-muted block mb-1">Cat</label>
            <select id="health-cat" value={formCatId} onChange={e => setFormCatId(e.target.value)}>
              <option value="" disabled>Select cat...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="health-title" className="text-xs text-muted block mb-1">Title</label>
            <input id="health-title" type="text" placeholder="e.g., Annual Checkup" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
          </div>
          <div>
            <label htmlFor="health-date" className="text-xs text-muted block mb-1">Date</label>
            <input id="health-date" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
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
            <label htmlFor="health-notes" className="text-xs text-muted block mb-1">Notes</label>
            <textarea id="health-notes" rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
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

      {/* Confirm dialog for health record deletion */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete health record"
        message="Are you sure you want to delete this health record?"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <NextImage src="/loading-health.webp" alt="No records" width={120} height={98} className="mx-auto mb-2 opacity-70" />
          <p className="text-muted text-sm">{loadError ? "Failed to load records." : "\"Not all who wander are lost...\" but no records were found here."}</p>
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
                    onDelete={(id) => setDeleteTarget(id)}
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
                    
                              onDelete={(id) => setDeleteTarget(id)}
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
      <div ref={litterSectionRef}>
        <LitterBoxSection
          litterLogs={litterLogs}
          isAdmin={isAdmin}
          onLogsChanged={loadData}
        />
      </div>
    </div>
  );
}
