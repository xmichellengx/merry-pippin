"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { getCats, getHealthRecords, addHealthRecord, deleteHealthRecord } from "@/lib/data";
import { malaysianVets, getVetsByState } from "@/lib/vets-malaysia";
import type { Cat, HealthRecord } from "@/lib/supabase";

const typeConfig: Record<string, { icon: typeof Syringe; color: string; bg: string }> = {
  vaccine: { icon: Syringe, color: "text-blue-600", bg: "bg-blue-50" },
  deworm: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50" },
  vet_visit: { icon: Stethoscope, color: "text-green-600", bg: "bg-green-50" },
  medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50" },
  other: { icon: Stethoscope, color: "text-gray-600", bg: "bg-gray-50" },
};

function RecordCard({ record, onDelete }: { record: HealthRecord; onDelete: (id: string) => void }) {
  const config = typeConfig[record.record_type] ?? typeConfig.other;
  const Icon = config.icon;
  const dueIn = record.next_due_date
    ? differenceInDays(new Date(record.next_due_date), new Date())
    : null;

  const vet = record.vet_name ? malaysianVets.find(v => v.name === record.vet_name) : null;

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
              {vet ? (
                <a
                  href={vet.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-golden-600 font-medium flex items-center gap-0.5 hover:underline"
                >
                  {record.vet_name} <span className="text-muted font-normal">({vet.area})</span>
                  <ExternalLink size={9} className="text-muted" />
                </a>
              ) : (
                <span className="text-[11px] text-golden-600 font-medium">{record.vet_name}</span>
              )}
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
  const [formType, setFormType] = useState("vaccine");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formDueDate, setFormDueDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formVet, setFormVet] = useState("");
  const [customVet, setCustomVet] = useState("");
  const [vetSearch, setVetSearch] = useState("");

  const loadData = () => {
    Promise.all([getCats(), getHealthRecords()])
      .then(([c, h]) => { setCats(c); setRecords(h); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!formCatId || !formTitle) return;
    const vetName = formVet === "__custom" ? customVet : formVet;
    setSaving(true);
    try {
      await addHealthRecord({
        cat_id: formCatId, record_type: formType, title: formTitle,
        date: formDate,
        ...(formDueDate ? { next_due_date: formDueDate } : {}),
        ...(formNotes ? { description: formNotes } : {}),
        ...(vetName ? { vet_name: vetName } : {}),
      });
      setShowAddForm(false);
      setFormCatId(""); setFormTitle(""); setFormDueDate(""); setFormNotes(""); setFormVet(""); setCustomVet(""); setVetSearch("");
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

  const vetsByState = getVetsByState();
  const filteredVets = vetSearch
    ? malaysianVets.filter(v =>
        v.name.toLowerCase().includes(vetSearch.toLowerCase()) ||
        v.area.toLowerCase().includes(vetSearch.toLowerCase()) ||
        v.state.toLowerCase().includes(vetSearch.toLowerCase())
      )
    : [];

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
            <label className="text-xs text-muted block mb-1">Type</label>
            <select value={formType} onChange={e => setFormType(e.target.value)}>
              <option value="vaccine">Vaccine</option>
              <option value="deworm">Deworming</option>
              <option value="vet_visit">Vet Visit</option>
              <option value="medication">Medication</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Title</label>
            <input type="text" placeholder="e.g., FVRCP Vaccine" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Next Due Date</label>
            <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} />
          </div>

          {/* Vet Selector */}
          <div>
            <label className="text-xs text-muted block mb-1">
              <MapPin size={11} className="inline mr-0.5" />
              Vet Clinic (optional)
            </label>
            <input
              type="text"
              placeholder="Search vet clinics in Malaysia..."
              value={vetSearch}
              onChange={e => { setVetSearch(e.target.value); if (formVet !== "__custom") setFormVet(""); }}
              className="mb-1"
            />
            {vetSearch && filteredVets.length > 0 && (
              <div className="max-h-36 overflow-y-auto rounded-lg border border-card-border bg-white">
                {filteredVets.map(vet => (
                  <button
                    key={vet.name}
                    type="button"
                    onClick={() => { setFormVet(vet.name); setVetSearch(""); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-golden-50 border-b border-card-border last:border-0 ${formVet === vet.name ? "bg-golden-50 font-semibold" : ""}`}
                  >
                    <span className="font-medium">{vet.name}</span>
                    <span className="text-muted ml-1">- {vet.area}, {vet.state}</span>
                  </button>
                ))}
              </div>
            )}
            {!vetSearch && (
              <select value={formVet} onChange={e => { setFormVet(e.target.value); setCustomVet(""); }}>
                <option value="">No vet selected</option>
                {Object.entries(vetsByState).map(([state, vets]) => (
                  <optgroup key={state} label={state}>
                    {vets.map(v => (
                      <option key={v.name} value={v.name}>{v.name} ({v.area})</option>
                    ))}
                  </optgroup>
                ))}
                <option value="__custom">Other (type manually)</option>
              </select>
            )}
            {formVet && formVet !== "__custom" && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-golden-500" />
                <span className="text-[11px] text-golden-600 font-medium">{formVet}</span>
                {(() => { const v = malaysianVets.find(v => v.name === formVet); return v ? (
                  <a href={v.maps_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted flex items-center gap-0.5 ml-1 hover:underline">
                    Open in Maps <ExternalLink size={9} />
                  </a>
                ) : null; })()}
              </div>
            )}
            {formVet === "__custom" && (
              <input
                type="text"
                placeholder="Enter vet clinic name..."
                value={customVet}
                onChange={e => setCustomVet(e.target.value)}
                className="mt-1"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !formCatId || !formTitle} className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
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
