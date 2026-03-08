"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, UtensilsCrossed, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { getCats, getFoodLogs, addFoodLog, deleteFoodLog } from "@/lib/data";
import type { Cat, FoodLog } from "@/lib/supabase";
import { CatEating, CatSleeping } from "@/components/CatIllustrations";
import { useAdmin } from "@/components/AdminContext";

const foodTypeEmoji: Record<string, string> = {
  wet: "\uD83E\uDD6B",
  dry: "\uD83E\uDD63",
  treat: "\uD83C\uDF6A",
  supplement: "\uD83D\uDC8A",
};

const mealTimeOrder = ["breakfast", "lunch", "snack", "dinner"];

export default function FoodPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = useAdmin();

  const [formCatId, setFormCatId] = useState("");
  const [formFoodName, setFormFoodName] = useState("");
  const [formFoodType, setFormFoodType] = useState("dry");
  const [formMealTime, setFormMealTime] = useState("breakfast");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const loadLogs = useCallback((date: string) => {
    getFoodLogs(date).then(f => setLogs(f)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCats().then(c => setCats(c));
    loadLogs(selectedDate);
  }, [selectedDate, loadLogs]);

  const handleSave = async () => {
    if (!formCatId || !formFoodName) return;
    setSaving(true);
    try {
      await addFoodLog({
        cat_id: formCatId, food_name: formFoodName, food_type: formFoodType,
        meal_time: formMealTime, date: selectedDate,
        ...(formAmount ? { amount_grams: parseFloat(formAmount) } : {}),
        ...(formNotes ? { notes: formNotes } : {}),
      });
      setShowAddForm(false);
      setFormCatId(""); setFormFoodName(""); setFormAmount(""); setFormNotes("");
      loadLogs(selectedDate);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteFoodLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const filteredLogs = logs
    .filter(f => selectedCat === "all" || f.cat_id === selectedCat)
    .sort((a, b) => mealTimeOrder.indexOf(a.meal_time) - mealTimeOrder.indexOf(b.meal_time));

  const totalGrams = filteredLogs.reduce((sum, f) => sum + (f.amount_grams ?? 0), 0);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return { value: format(d, "yyyy-MM-dd"), label: i === 0 ? "Today" : i === 1 ? "Yesterday" : format(d, "EEE"), date: format(d, "d") };
  });

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-3"><CatSleeping size={120} className="opacity-30" /><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Food Log</h1>
        </div>
        {isAdmin && <button onClick={() => setShowAddForm(!showAddForm)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"><Plus size={18} className="text-white" /></button>}
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {dates.map(d => (
          <button key={d.value} onClick={() => setSelectedDate(d.value)} className={`flex flex-col items-center min-w-[3.5rem] px-2 py-2 rounded-xl text-xs transition-colors ${selectedDate === d.value ? "golden-gradient text-white shadow-md" : "bg-golden-50 text-foreground/70"}`}>
            <span className="font-medium">{d.label}</span>
            <span className={`text-lg font-bold ${selectedDate === d.value ? "" : "text-foreground"}`}>{d.date}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>All</button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Total intake</p>
            <p className="text-2xl font-bold text-golden-600">{totalGrams}g</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Meals logged</p>
            <p className="text-2xl font-bold text-foreground">{filteredLogs.length}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          {(["dry", "wet", "treat", "supplement"] as const).map(type => {
            const typeTotal = filteredLogs.filter(f => f.food_type === type).reduce((s, f) => s + (f.amount_grams ?? 0), 0);
            if (typeTotal === 0) return null;
            return <div key={type} className="flex items-center gap-1"><span className="text-sm">{foodTypeEmoji[type]}</span><span className="text-[10px] text-muted">{typeTotal}g</span></div>;
          })}
        </div>
      </div>

      {isAdmin && showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Log Meal</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select value={formCatId} onChange={e => setFormCatId(e.target.value)}>
              <option value="" disabled>Select cat...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Food Name</label>
            <input type="text" placeholder="e.g., Royal Canin British Shorthair" value={formFoodName} onChange={e => setFormFoodName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Type</label>
              <select value={formFoodType} onChange={e => setFormFoodType(e.target.value)}>
                <option value="dry">Dry Food</option>
                <option value="wet">Wet Food</option>
                <option value="treat">Treat</option>
                <option value="supplement">Supplement</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Meal Time</label>
              <select value={formMealTime} onChange={e => setFormMealTime(e.target.value)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Amount (grams)</label>
            <input type="number" placeholder="e.g., 85" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !formCatId || !formFoodName} className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
              {saving ? "Saving..." : "Save Meal"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <CatEating size={90} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted">No meals logged for this day.</p>
          {isAdmin && <button onClick={() => setShowAddForm(true)} className="mt-3 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md">Log First Meal</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(meal => {
            const cat = cats.find(c => c.id === meal.cat_id);
            return (
              <div key={meal.id} className="card p-4 card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{foodTypeEmoji[meal.food_type]}</span>
                    <div>
                      <p className="text-sm font-medium">{meal.food_name}</p>
                      <p className="text-[10px] text-muted">{cat?.name} &middot; {meal.meal_time.charAt(0).toUpperCase() + meal.meal_time.slice(1)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      {meal.amount_grams && <p className="text-sm font-semibold text-golden-600">{meal.amount_grams}g</p>}
                      <span className="badge badge-info">{meal.food_type}</span>
                    </div>
                    {isAdmin && <button onClick={() => handleDelete(meal.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>}
                  </div>
                </div>
                {meal.notes && <p className="text-xs text-muted mt-2 pl-9">{meal.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
