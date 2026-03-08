"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getCats, getWeightRecords, addWeightRecord, deleteWeightRecord } from "@/lib/data";
import type { Cat, WeightRecord } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CatOnScale, CatSleeping } from "@/components/CatIllustrations";

export default function WeightPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formCatId, setFormCatId] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formNotes, setFormNotes] = useState("");

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
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteWeightRecord(id);
    setWeights(prev => prev.filter(w => w.id !== id));
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-3"><CatSleeping size={120} className="opacity-30" /><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
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

  const colors = ["#E8932B", "#D97A1E"];

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Weight Tracker</h1>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"><Plus size={18} className="text-white" /></button>
      </div>

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8D8" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9C8B7A" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9C8B7A" unit="kg" />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #F3E8D8", borderRadius: "0.75rem", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {cats.filter(c => selectedCat === "all" || selectedCat === c.id).map((cat, i) => (
                  <Line key={cat.id} type="monotone" dataKey={cat.name} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={{ r: 4, fill: colors[i % colors.length] }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Log Weight</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select value={formCatId} onChange={e => setFormCatId(e.target.value)}>
              <option value="" disabled>Select cat...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Weight (kg)</label>
            <input type="number" step="0.01" placeholder="e.g., 4.5" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !formCatId || !formWeight} className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
              {saving ? "Saving..." : "Save Weight"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {cats.filter(c => selectedCat === "all" || selectedCat === c.id).map(cat => {
        const catWeights = weights.filter(w => w.cat_id === cat.id);
        if (catWeights.length === 0) return (
          <div key={cat.id} className="card p-6 text-center">
            <CatOnScale size={80} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted">No weight records for {cat.name} yet.</p>
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
                    <button onClick={() => handleDelete(w.id)} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
