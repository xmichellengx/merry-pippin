"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { getCats, getHealthRecords, addHealthRecords, deleteHealthRecord } from "@/lib/data";
import type { Cat, HealthRecord } from "@/lib/supabase";

const typeConfig: Record<string, { icon: typeof Syringe; color: string; bg: string }> = {
  vaccine: { icon: Syringe, color: "text-blue-600", bg: "bg-blue-50" },
  deworm: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50" },
  vet_visit: { icon: Stethoscope, color: "text-green-600", bg: "bg-green-50" },
  medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50" },
  other: { icon: Stethoscope, color: "text-gray-600", bg: "bg-gray-50" },
};

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

function RecordCard({ record, onDelete }: { record: HealthRecord; onDelete: (id: string) => void }) {
  const config = typeConfig[record.record_type] ?? typeConfig.other;
  const Icon = config.icon;
  const dueIn = record.next_due_date
    ? differenceInDays(new Date(record.next_due_date), new Date())
    : null;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{record.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted">{format(new Date(record.date), "MMM d, yyyy")}</span>
              <button onClick={() => onDelete(record.id)} className="text-muted hover:text-danger">
                <Trash2 size={12} />
              </button>
            </div>
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
          {record.next_due_date && dueIn !== null && (
            <div className="mt-2">
              <span className={`badge ${dueIn < 0 ? "badge-danger" : dueIn <= 30 ? "badge-warning" : "badge-success"}`}>
                {dueIn < 0
                  ? `Overdue by ${Math.abs(dueIn)} days`
                  : dueIn === 0
                  ? "Due today"
                  : `Due in ${dueIn} days`}
              </span>
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

  // Form state
  const [formCatId, setFormCatId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formNotes, setFormNotes] = useState("");
  const [formVet, setFormVet] = useState("");
  const [formTypes, setFormTypes] = useState<Record<string, { checked: boolean; dueDate: string }>>({
    vaccine: { checked: false, dueDate: "" },
    deworm: { checked: false, dueDate: "" },
    vet_visit: { checked: false, dueDate: "" },
    medication: { checked: false, dueDate: "" },
    other: { checked: false, dueDate: "" },
  });

  const loadData = () => {
    Promise.all([getCats(), getHealthRecords()])
      .then(([c, h]) => { setCats(c); setRecords(h); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const checkedTypes = Object.entries(formTypes).filter(([, v]) => v.checked);

  const handleSave = async () => {
    if (!formCatId || !formTitle || checkedTypes.length === 0) return;
    setSaving(true);
    try {
      const records = checkedTypes.map(([type, { dueDate }]) => ({
        cat_id: formCatId,
        record_type: type,
        title: formTitle,
        date: formDate,
        ...(dueDate ? { next_due_date: dueDate } : {}),
        ...(formNotes ? { description: formNotes } : {}),
        ...(formVet ? { vet_name: formVet } : {}),
      }));
      await addHealthRecords(records);
      setShowAddForm(false);
      setFormCatId(""); setFormTitle(""); setFormNotes(""); setFormVet("");
      setFormTypes({
        vaccine: { checked: false, dueDate: "" },
        deworm: { checked: false, dueDate: "" },
        vet_visit: { checked: false, dueDate: "" },
        medication: { checked: false, dueDate: "" },
        other: { checked: false, dueDate: "" },
      });
      loadData();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteHealthRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
  }

  const filtered = records
    .filter(r => selectedCat === "all" || r.cat_id === selectedCat)
    .filter(r => filterType === "all" || r.record_type === filterType);

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Health Records</h1>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md">
          <Plus size={18} className="text-white" />
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>All</button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {["all", "vaccine", "deworm", "vet_visit", "medication"].map(type => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterType === type ? "bg-foreground text-white" : "bg-golden-50 text-foreground/70"}`}>
            {type === "all" ? "All Types" : type === "vet_visit" ? "Vet Visit" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {showAddForm && (
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
            <div className="space-y-2">
              {Object.entries(formTypes).map(([type, { checked, dueDate }]) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                const label = type === "vet_visit" ? "Vet Visit" : type === "other" ? "Other" : type.charAt(0).toUpperCase() + type.slice(1);
                return (
                  <div key={type} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setFormTypes(prev => ({
                          ...prev,
                          [type]: { ...prev[type], checked: e.target.checked },
                        }))}
                        className="w-4 h-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500"
                      />
                      <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <Icon size={13} className={config.color} />
                      </div>
                      <span className="text-xs font-medium">{label}</span>
                    </label>
                    {checked && (
                      <div className="ml-12">
                        <label className="text-[11px] text-muted block mb-0.5">Next due date for {label.toLowerCase()}</label>
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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted text-sm">No records found.</p>
          </div>
        ) : (
          filtered.map(record => <RecordCard key={record.id} record={record} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}
