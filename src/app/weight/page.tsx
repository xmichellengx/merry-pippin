"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Loader2, Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { getWeightRecords, addWeightRecord, deleteWeightRecord, updateWeightRecord } from "@/lib/data";
import type { WeightRecord } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";
import { FilterChip } from "@/components/FilterChip";
import { PageHeader } from "@/components/PageHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import Modal from "@/components/Modal";
import { useCats } from "@/hooks/useCats";

const WeightChart = dynamic(() => import("@/components/WeightChart"), {
  loading: () => <div className="h-56 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-golden-400" /></div>,
  ssr: false,
});
import { AiInsights } from "@/components/AiInsights";

export default function WeightPage() {
  const { cats } = useCats();
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = useAdmin();
  const { showToast } = useToast();

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

  // ConfirmDialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = () => {
    getWeightRecords()
      .then(w => setWeights(w))
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
      showToast("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    } finally { setSaving(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
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
      showToast("Failed to update: " + (err instanceof Error ? err.message : String(err)));
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
        const first = catWeights[0];
        const last = catWeights[catWeights.length - 1];
        const days = (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
        const weeks = days / 7;
        const totalGain = last.weight_kg - first.weight_kg;
        const weeklyGain = weeks > 0 ? (totalGain / weeks) : 0;
        lines.push(`Pre-computed stats: first=${first.weight_kg}kg on ${first.recorded_at}, latest=${last.weight_kg}kg on ${last.recorded_at}, total gain=${totalGain.toFixed(2)}kg over ${Math.round(days)} days (${weeks.toFixed(1)} weeks), average weekly gain=${(weeklyGain * 1000).toFixed(0)}g/week`);
      }
    });
    return lines.join("\n");
  }, [cats, weights]);

  if (loading) {
    return <LoadingScreen image="/loading-weight.webp" />;
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
    <div className="px-4 pt-12 pb-6 space-y-4">
      <PageHeader title="Weight Tracker" action={isAdmin ? <ActionButton onClick={() => setShowAddForm(!showAddForm)} label="Add weight record" /> : undefined} />

      <AiInsights
        cacheKey="weight"
        title="Weight Summary"
        loadingText="Analyzing growth trends..."
        context={weightContext}
        prompt={`You are a vet advisor for Golden British Shorthair Munchkin kittens. Analyze their weight data and give 2-3 insights as a dash-separated list.

IMPORTANT: Use the pre-computed stats provided in the context for weekly gain figures — do NOT recalculate them yourself, as the numbers are already accurate.

Think like a vet looking at a growth chart:
- Use the exact "average weekly gain" figure from the pre-computed stats for each cat.
- Compare growth rate against typical BSH kitten growth curves for their age. BSH kittens typically gain ~100-150g/week in months 3-6, slowing to ~50-100g/week from 6-12 months.
- If one cat is consistently heavier/lighter than the other, state clearly which one is heavier and by how much.
- If growth looks on track, say so briefly. Don't manufacture concerns.
- Be specific with the exact numbers from the data.

Plain text only, no markdown. Jump straight into insights, no intro.`}
      />

      <div className="flex gap-2">
        <FilterChip active={selectedCat === "all"} onClick={() => setSelectedCat("all")}>Compare</FilterChip>
        {cats.map(cat => (
          <FilterChip key={cat.id} active={selectedCat === cat.id} onClick={() => setSelectedCat(cat.id)}>{cat.name}</FilterChip>
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

      <Modal open={isAdmin && showAddForm} onClose={() => setShowAddForm(false)} title="Log Weight">
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
          <label htmlFor="add-weight-kg" className="text-xs text-muted block mb-1">{formCatId ? `${cats.find(c => c.id === formCatId)?.name}'s weight (kg)` : "Weight (kg)"}</label>
          <div className="relative">
            <input id="add-weight-kg" type="number" step="0.01" placeholder={(() => { const last = formCatId ? weights.filter(w => w.cat_id === formCatId).slice(-1)[0] : null; return last ? `Last: ${last.weight_kg} kg` : "e.g., 1.85"; })()} value={formWeight} onChange={e => setFormWeight(e.target.value)} className="pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">kg</span>
          </div>
        </div>
        <div>
          <label htmlFor="add-weight-date" className="text-xs text-muted block mb-1">Date</label>
          <input id="add-weight-date" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="add-weight-notes" className="text-xs text-muted block mb-1">Notes</label>
          <textarea id="add-weight-notes" rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={saving || !formCatId || !formWeight} className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </Modal>

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
                {prev && change !== 0 && (
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
                        <button onClick={() => openEdit(w)} aria-label="Edit weight record" className="p-2 text-muted hover:text-golden-600 focus-visible:ring-2 focus-visible:ring-golden-400 rounded"><Pencil size={11} /></button>
                        <button onClick={() => setDeleteId(w.id)} aria-label="Delete weight record" className="p-2 text-muted hover:text-danger focus-visible:ring-2 focus-visible:ring-golden-400 rounded"><Trash2 size={11} /></button>
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
      <Modal open={!!editingWeight} onClose={() => setEditingWeight(null)} title="Edit Weight">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full golden-gradient flex items-center justify-center">
            <span className="text-white font-bold text-[9px]">{cats.find(c => c.id === editingWeight?.cat_id)?.name[0]}</span>
          </div>
          <span className="text-sm font-medium">{cats.find(c => c.id === editingWeight?.cat_id)?.name}</span>
        </div>
        <div>
          <label htmlFor="edit-weight-kg" className="text-xs text-muted block mb-1">Weight (kg)</label>
          <div className="relative">
            <input id="edit-weight-kg" type="number" step="0.01" value={editWeight} onChange={e => setEditWeight(e.target.value)} className="pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">kg</span>
          </div>
        </div>
        <div>
          <label htmlFor="edit-weight-date" className="text-xs text-muted block mb-1">Date</label>
          <input id="edit-weight-date" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-weight-notes" className="text-xs text-muted block mb-1">Notes</label>
          <textarea id="edit-weight-notes" rows={2} placeholder="Optional notes..." value={editNotes} onChange={e => setEditNotes(e.target.value)} />
        </div>
        <button onClick={handleEditSave} disabled={editSaving || !editWeight} className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
          {editSaving ? "Saving..." : "Update"}
        </button>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Record"
        message="This weight record will be permanently removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
