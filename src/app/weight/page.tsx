"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Loader2, Trash2, Pencil, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getCats, getWeightRecords, addWeightRecord, deleteWeightRecord, updateWeightRecord } from "@/lib/data";
import type { Cat, WeightRecord } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { useAdmin } from "@/components/AdminContext";

const WeightChart = dynamic(() => import("@/components/WeightChart"), {
  loading: () => <div className="h-56 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-golden-400" /></div>,
  ssr: false,
});
import { AiInsights } from "@/components/AiInsights";

export default function WeightPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = useAdmin();

  const [formCatId, setFormCatId] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formNotes, setFormNotes] = useState("");

  // Edit modal state
  const [editingWeight, setEditingWeight] = useState<WeightRecord | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const loadData = () => {
    Promise.all([getCats(), getWeightRecords()])
      .then(([c, w]) => { setCats(c); setWeights(w); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!formCatId || !formWeight) return;
    setSaving(true);
    try {
      await addWeightRecord({
        cat_id: formCatId, weight_kg: parseFloat(formWeight), recorded_at: formDate,
        ...(formNotes ? { notes: formNotes } : {}),
      });
      setShowAddForm(false);
      setFormCatId(""); setFormWeight(""); setFormNotes("");
      loadData();
    } catch (err) {
      alert("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteWeightRecord(id);
    setWeights(prev => prev.filter(w => w.id !== id));
  };

  const openEdit = (record: WeightRecord) => {
    setEditingWeight(record);
    setEditWeight(record.weight_kg.toString());
    setEditDate(record.recorded_at);
    setEditNotes(record.notes ?? "");
  };

  const handleEditSave = async () => {
    if (!editingWeight || !editWeight) return;
    setEditSaving(true);
    try {
      await updateWeightRecord(editingWeight.id, {
        weight_kg: parseFloat(editWeight),
        recorded_at: editDate,
        notes: editNotes || null,
      });
      setEditingWeight(null);
      loadData();
    } catch (err) {
      alert("Failed to update: " + (err instanceof Error ? err.message : String(err)));
    } finally { setEditSaving(false); }
  };

  const weightContext = useMemo(() => {
    if (cats.length === 0) return "";
    const lines: string[] = [];
    cats.forEach(cat => {
      const catWeights = weights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
      lines.push(`\n${cat.name} — ${cat.breed}, DOB: ${cat.date_of_birth || "unknown"}, Gender: ${cat.gender || "unknown"}`);
      if (catWeights.length > 0) {
        lines.push(`Weight history: ${catWeights.map(w => `${w.weight_kg}kg (${w.recorded_at})${w.notes ? ` [${w.notes}]` : ""}`).join(" → ")}`);
      }
    });
    return lines.join("\n");
  }, [cats, weights]);

  if (loading) {
    return <div className="flex flex-col items-center pt-32 gap-3"><Image src="/loading-weight.webp" alt="" width={180} height={180} priority className="opacity-80" /><Loader2 size={28} className="text-golden-500 animate-spin" /></div>;
  }

  // Build chart data
  const allDates = new Set<string>();
  weights.forEach(w => allDates.add(w.recorded_at));

  const chartData = Array.from(allDates).sort().map(date => {
    const entry: Record<string, string | number> = { date: format(new Date(date), "MMM yy") };
    cats.forEach(cat => {
      const w = weights.find(w => w.cat_id === cat.id && w.recorded_at === date);
      if (w) entry[cat.name] = w.weight_kg;
    });
    return entry;
  });

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Weight Tracker</h1>
        </div>
        {isAdmin && <button onClick={() => setShowAddForm(!showAddForm)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"><Plus size={18} className="text-white" /></button>}
      </div>

      <AiInsights
        cacheKey="weight"
        title="Weight Summary"
        loadingText="Analyzing growth trends..."
        context={weightContext}
        prompt={`You are a vet advisor for Golden British Shorthair Munchkin kittens. Analyze their weight data and give 2-3 insights as a dash-separated list.

Think like a vet looking at a growth chart:
- These kittens are weighed every few weeks. Look at the OVERALL multi-week/month trajectory, not individual weigh-ins.
- Compare growth rate against typical BSH kitten growth curves for their age. BSH kittens typically gain ~100-150g/week in months 3-6, slowing to ~50-100g/week from 6-12 months.
- If one cat is consistently heavier/lighter than the other, note the difference and whether it's normal variation or concerning.
- Calculate their average monthly weight gain and comment on whether it's healthy.
- If growth looks on track, say so briefly. Don't manufacture concerns.
- Be specific with numbers. No vague advice.

Plain text only, no markdown. Jump straight into insights, no intro.`}
      />

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>Compare</button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold text-sm mb-3">Growth Chart</h2>
          <div className="h-56">
            <WeightChart chartData={chartData} cats={cats} selectedCat={selectedCat} />
          </div>
        </div>
      )}

      {isAdmin && showAddForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-6" onClick={() => setShowAddForm(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <h3 className="font-bold text-sm">Log Weight</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center"><X size={14} className="text-golden-700" /></button>
            </div>
            <div className="flex gap-2">
              {cats.map(c => {
                const lastW = weights.filter(w => w.cat_id === c.id).slice(-1)[0];
                return (
                  <button key={c.id} onClick={() => setFormCatId(c.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formCatId === c.id ? "golden-gradient text-white shadow-sm" : "bg-golden-50 text-golden-700"}`}>
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[9px] font-bold">{c.name[0]}</div>
                    <span>{c.name}</span>
                    {lastW && <span className="opacity-70 text-[10px]">{lastW.weight_kg}kg</span>}
                  </button>
                );
              })}
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">{formCatId ? `${cats.find(c => c.id === formCatId)?.name}'s weight (kg)` : "Weight (kg)"}</label>
              <div className="relative">
                <input type="number" step="0.01" placeholder={(() => { const last = formCatId ? weights.filter(w => w.cat_id === formCatId).slice(-1)[0] : null; return last ? `Last: ${last.weight_kg} kg` : "e.g., 1.85"; })()} value={formWeight} onChange={e => setFormWeight(e.target.value)} className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">kg</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Date</label>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Notes</label>
              <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={saving || !formCatId || !formWeight} className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {cats.filter(c => selectedCat === "all" || selectedCat === c.id).map(cat => {
        const catWeights = weights.filter(w => w.cat_id === cat.id);
        if (catWeights.length === 0) return (
          <div key={cat.id} className="card p-6 text-center">
            <Image src="/loading-weight.webp" alt="No records" width={100} height={96} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm text-muted">&quot;A wizard is never late...&quot; but {cat.name}&apos;s first weigh-in is overdue!</p>
          </div>
        );
        const latest = catWeights[catWeights.length - 1];
        const prev = catWeights.length >= 2 ? catWeights[catWeights.length - 2] : null;
        const change = prev ? latest.weight_kg - prev.weight_kg : 0;
        const isGain = change > 0;

        return (
          <div key={cat.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full golden-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{cat.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <p className="text-[10px] text-muted">Latest: {format(new Date(latest.recorded_at), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-golden-600">{latest.weight_kg} kg</p>
                {prev && (
                  <div className={`flex items-center gap-0.5 justify-end ${isGain ? "text-success" : "text-danger"}`}>
                    {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span className="text-[10px] font-medium">{isGain ? "+" : ""}{change.toFixed(2)} kg</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              {catWeights.slice(-5).reverse().map(w => (
                <div key={w.id} className="flex justify-between items-center text-xs py-1 border-b border-card-border last:border-0">
                  <span className="text-muted">{format(new Date(w.recorded_at), "MMM d, yyyy")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{w.weight_kg} kg</span>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(w)} className="text-muted hover:text-golden-600"><Pencil size={11} /></button>
                        <button onClick={() => handleDelete(w.id)} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Edit Weight Modal */}
      {editingWeight && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-6" onClick={() => setEditingWeight(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <h3 className="font-bold text-sm">Edit Weight</h3>
              </div>
              <button onClick={() => setEditingWeight(null)} className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center"><X size={14} className="text-golden-700" /></button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full golden-gradient flex items-center justify-center">
                <span className="text-white font-bold text-[9px]">{cats.find(c => c.id === editingWeight.cat_id)?.name[0]}</span>
              </div>
              <span className="text-sm font-medium">{cats.find(c => c.id === editingWeight.cat_id)?.name}</span>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Weight (kg)</label>
              <div className="relative">
                <input type="number" step="0.01" value={editWeight} onChange={e => setEditWeight(e.target.value)} className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">kg</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Date</label>
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Notes</label>
              <textarea rows={2} placeholder="Optional notes..." value={editNotes} onChange={e => setEditNotes(e.target.value)} />
            </div>
            <button onClick={handleEditSave} disabled={editSaving || !editWeight} className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
              {editSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
