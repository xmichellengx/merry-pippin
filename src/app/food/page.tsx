"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import { format, subDays } from "date-fns";
import { getFoodLogs, addFoodLog, deleteFoodLog, updateFoodLog } from "@/lib/data";
import type { FoodLog } from "@/lib/supabase";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";
import { AiInsights } from "@/components/AiInsights";
import { getWeightRecords } from "@/lib/data";
import type { WeightRecord } from "@/lib/supabase";
import { FilterChip } from "@/components/FilterChip";
import { PageHeader } from "@/components/PageHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import Modal from "@/components/Modal";
import { useCats } from "@/hooks/useCats";

const foodTypeEmoji: Record<string, string> = {
  wet: "\uD83E\uDD6B",
  dry: "\uD83E\uDD63",
  raw: "\uD83E\uDD69",
  treat: "\uD83C\uDF6A",
  supplement: "\uD83D\uDC8A",
};

const foodTypeLabels: Record<string, string> = {
  wet: "Wet",
  dry: "Dry",
  raw: "Raw",
  treat: "Treat",
  supplement: "Supplement",
};

const allFoodTypes = ["dry", "wet", "raw", "treat", "supplement"];

const mealTimeOrder = ["breakfast", "lunch", "snack", "dinner"];

// Helper to get emojis for a potentially multi-type food_type string
function getTypeEmojis(foodType: string) {
  const types = foodType.split(",").map(t => t.trim());
  return types.map(t => foodTypeEmoji[t] || "").join("");
}

function getTypeLabels(foodType: string) {
  const types = foodType.split(",").map(t => t.trim());
  return types.map(t => foodTypeLabels[t] || t).join(" + ");
}

// Multi-select food type chip component
function FoodTypeChips({ selected, onChange }: { selected: string[]; onChange: (types: string[]) => void }) {
  const toggle = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter(t => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {allFoodTypes.map(type => (
        <button
          key={type}
          type="button"
          onClick={() => toggle(type)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
            selected.includes(type)
              ? "golden-gradient text-white shadow-sm"
              : "bg-golden-50 text-golden-700"
          }`}
        >
          <span>{foodTypeEmoji[type]}</span>
          <span>{foodTypeLabels[type]}</span>
        </button>
      ))}
    </div>
  );
}

export default function FoodPage() {
  const { cats } = useCats();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = useAdmin();
  const { showToast } = useToast();

  const [formCatId, setFormCatId] = useState("");
  const [formFoodName, setFormFoodName] = useState("");
  const [formFoodTypes, setFormFoodTypes] = useState<string[]>(["dry"]);
  const [formMealTime, setFormMealTime] = useState("breakfast");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Edit modal state
  const [editingMeal, setEditingMeal] = useState<FoodLog | null>(null);
  const [editCatId, setEditCatId] = useState("");
  const [editFoodName, setEditFoodName] = useState("");
  const [editFoodTypes, setEditFoodTypes] = useState<string[]>(["dry"]);
  const [editMealTime, setEditMealTime] = useState("breakfast");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // ConfirmDialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Recent food (last 50) + weights for AI context
  const [recentFood, setRecentFood] = useState<FoodLog[]>([]);
  const [catWeights, setCatWeights] = useState<WeightRecord[]>([]);

  const loadLogs = useCallback((date: string) => {
    getFoodLogs(date).then(f => setLogs(f)).finally(() => setLoading(false));
  }, []);

  // Load page data — today's logs are critical path
  useEffect(() => {
    loadLogs(selectedDate);
  }, [selectedDate, loadLogs]);

  // Load AI context data — refreshed after mutations via refreshKey
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    Promise.all([
      getFoodLogs(undefined, undefined, 50),
      getWeightRecords(undefined, 10),
    ]).then(([food, weights]) => {
      setRecentFood(food);
      setCatWeights(weights);
    });
  }, [refreshKey]);

  const handleSave = async () => {
    if (!formCatId || !formFoodName || formFoodTypes.length === 0) return;
    setSaving(true);
    try {
      await addFoodLog({
        cat_id: formCatId, food_name: formFoodName, food_type: formFoodTypes.join(","),
        meal_time: formMealTime, date: selectedDate,
        ...(formAmount ? { amount_grams: parseFloat(formAmount) } : {}),
        ...(formNotes ? { notes: formNotes } : {}),
      });
      setShowAddForm(false);
      setFormCatId(""); setFormFoodName(""); setFormFoodTypes(["dry"]); setFormAmount(""); setFormNotes("");
      loadLogs(selectedDate);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    } finally { setSaving(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    await deleteFoodLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
    setRefreshKey(k => k + 1);
  };

  const openEdit = (meal: FoodLog) => {
    setEditingMeal(meal);
    setEditCatId(meal.cat_id);
    setEditFoodName(meal.food_name);
    setEditFoodTypes(meal.food_type.split(",").map(t => t.trim()));
    setEditMealTime(meal.meal_time);
    setEditAmount(meal.amount_grams?.toString() ?? "");
    setEditNotes(meal.notes ?? "");
  };

  const handleEditSave = async () => {
    if (!editingMeal || !editCatId || !editFoodName || editFoodTypes.length === 0) return;
    setEditSaving(true);
    try {
      await updateFoodLog(editingMeal.id, {
        cat_id: editCatId,
        food_name: editFoodName,
        food_type: editFoodTypes.join(","),
        meal_time: editMealTime,
        amount_grams: editAmount ? parseFloat(editAmount) : null,
        notes: editNotes || null,
      });
      setEditingMeal(null);
      loadLogs(selectedDate);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    } finally { setEditSaving(false); }
  };

  const filteredLogs = logs
    .filter(f => selectedCat === "all" || f.cat_id === selectedCat)
    .sort((a, b) => mealTimeOrder.indexOf(a.meal_time) - mealTimeOrder.indexOf(b.meal_time));

  const totalGrams = filteredLogs.reduce((sum, f) => sum + (f.amount_grams ?? 0), 0);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return { value: format(d, "yyyy-MM-dd"), label: i === 0 ? "Today" : i === 1 ? "Yesterday" : format(d, "EEE"), date: format(d, "d") };
  });

  const foodContext = useMemo(() => {
    if (cats.length === 0 || recentFood.length === 0) return "";
    const lines: string[] = [];
    cats.forEach(cat => {
      const cw = catWeights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
      const latestWeight = cw.length > 0 ? cw[cw.length - 1] : null;
      const weightKg = latestWeight?.weight_kg ?? 0;

      // Calculate age in months
      let ageMonths = "";
      if (cat.date_of_birth) {
        const dob = new Date(cat.date_of_birth);
        const now = new Date();
        const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
        ageMonths = `${months} months old`;
      }

      lines.push(`\n${cat.name} — ${cat.breed}, ${ageMonths || `DOB: ${cat.date_of_birth || "unknown"}`}, Gender: ${cat.gender || "unknown"}${latestWeight ? `, Current weight: ${weightKg}kg (as of ${latestWeight.recorded_at})` : ""}`);

      const catFood = recentFood.filter(f => f.cat_id === cat.id);
      if (catFood.length > 0) {
        // Group by day with gram totals
        const dailyData: Record<string, { meals: string[]; totalGrams: number; wetGrams: number; dryGrams: number; notes: string[] }> = {};
        catFood.forEach(f => {
          if (!dailyData[f.date]) dailyData[f.date] = { meals: [], totalGrams: 0, wetGrams: 0, dryGrams: 0, notes: [] };
          const d = dailyData[f.date];
          const grams = f.amount_grams ?? 0;
          d.meals.push(`${f.food_name} (${f.food_type}, ${f.meal_time}${grams ? `, ${grams}g` : ""})`);
          d.totalGrams += grams;
          if (f.food_type.toLowerCase().includes("wet")) d.wetGrams += grams;
          if (f.food_type.toLowerCase().includes("dry")) d.dryGrams += grams;
          if (f.notes) d.notes.push(f.notes);
        });
        const sortedDays = Object.entries(dailyData).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);

        lines.push(`Daily intake (last ${sortedDays.length} days):`);
        sortedDays.forEach(([date, d]) => {
          const breakdown = [d.wetGrams > 0 ? `${d.wetGrams}g wet` : "", d.dryGrams > 0 ? `${d.dryGrams}g dry` : ""].filter(Boolean).join(" + ");
          lines.push(`- ${date}: ${d.totalGrams}g total${breakdown ? ` (${breakdown})` : ""} — ${d.meals.length} meals`);
          if (d.notes.length > 0) lines.push(`  Notes: ${d.notes.join("; ")}`);
        });
      }
    });
    return lines.join("\n");
  }, [cats, recentFood, catWeights]);

  if (loading) {
    return <LoadingScreen image="/loading-food.webp" />;
  }

  return (
    <div className="px-4 pt-12 pb-6 space-y-4">
      <PageHeader title="Food Log" action={isAdmin ? <ActionButton onClick={() => setShowAddForm(!showAddForm)} label="Log meal" /> : undefined} />

      <AiInsights
        cacheKey="food"
        title="Nutrition Summary"
        loadingText="Analyzing feeding patterns..."
        context={foodContext}
        prompt={`You are an experienced feline nutritionist specializing in British Shorthair kittens. Give 2-3 concise observations as a dash-separated list.

IMPORTANT GUIDELINES FOR GRAM RECOMMENDATIONS:
- BSH kittens need roughly 40-65g of food per kg of body weight per day
- BUT wet food is ~80% water while dry food is ~10% water, so you cannot compare them equally
- A kitten eating mostly wet food will naturally eat MORE grams (because of water content) — this is normal and healthy, NOT overfeeding
- Rough guide: ~20-30g dry food per kg/day OR ~60-80g wet food per kg/day, or a proportional mix
- Only flag intake as concerning if it's significantly outside these ranges for their weight

Your observations should cover:
- Is their daily gram intake appropriate for their age and weight? (use the ranges above, accounting for their wet/dry ratio)
- Is the wet/dry balance good? (a mix is ideal for hydration + dental health)
- Any concerns from owner notes? (appetite changes, vomiting, picky eating)

Be specific — mention their actual intake numbers and whether it looks right. Do NOT mention calories or kcal. Keep it practical and reassuring unless there's a genuine concern.

Plain text only, no markdown. No intro.`}
      />

      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {dates.map(d => (
          <button key={d.value} onClick={() => setSelectedDate(d.value)} className={`flex flex-col items-center min-w-[3.5rem] px-2 py-2 rounded-xl text-xs transition-colors ${selectedDate === d.value ? "golden-gradient text-white shadow-md" : "bg-golden-50 text-foreground/70"}`}>
            <span className="font-medium">{d.label}</span>
            <span className={`text-lg font-bold ${selectedDate === d.value ? "" : "text-foreground"}`}>{d.date}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <FilterChip active={selectedCat === "all"} onClick={() => setSelectedCat("all")}>All</FilterChip>
        {cats.map(cat => (
          <FilterChip key={cat.id} active={selectedCat === cat.id} onClick={() => setSelectedCat(cat.id)}>{cat.name}</FilterChip>
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
          {allFoodTypes.map(type => {
            const typeTotal = filteredLogs.filter(f => f.food_type.split(",").map(t => t.trim()).includes(type)).reduce((s, f) => s + (f.amount_grams ?? 0), 0);
            if (typeTotal === 0) return null;
            return <div key={type} className="flex items-center gap-1"><span className="text-sm">{foodTypeEmoji[type]}</span><span className="text-[10px] text-muted">{typeTotal}g</span></div>;
          })}
        </div>
      </div>

      <Modal open={isAdmin && showAddForm} onClose={() => setShowAddForm(false)} title="Log Meal" position="bottom">
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
        <div>
          <label className="text-xs text-muted block mb-1">Type (tap to select, can pick multiple)</label>
          <FoodTypeChips selected={formFoodTypes} onChange={setFormFoodTypes} />
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
        <div>
          <label className="text-xs text-muted block mb-1">Amount (grams)</label>
          <input type="number" placeholder="e.g., 85" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Notes</label>
          <textarea rows={2} placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving || !formCatId || !formFoodName || formFoodTypes.length === 0} className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
            {saving ? "Saving..." : "Save Meal"}
          </button>
          <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">Cancel</button>
        </div>
      </Modal>

      {filteredLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <Image src="/loading-food.webp" alt="No meals" width={120} height={104} className="mx-auto mb-2 opacity-70" />
          <p className="text-sm text-muted">&quot;What about second breakfast?&quot; No meals logged for this day.</p>
          {isAdmin && <button onClick={() => setShowAddForm(true)} className="mt-3 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md">Log First Meal</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(meal => {
            const cat = cats.find(c => c.id === meal.cat_id);
            return (
              <div key={meal.id} className="card p-4 card-hover">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{getTypeEmojis(meal.food_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{meal.food_name}</p>
                        <p className="text-[10px] text-muted">{cat?.name} &middot; {meal.meal_time.charAt(0).toUpperCase() + meal.meal_time.slice(1)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {meal.amount_grams && <p className="text-sm font-semibold text-golden-600">{meal.amount_grams}g</p>}
                        <span className="badge badge-info text-[9px]">{getTypeLabels(meal.food_type)}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <button onClick={() => openEdit(meal)} aria-label="Edit meal" className="p-2 text-muted hover:text-golden-600 focus-visible:ring-2 focus-visible:ring-golden-400 rounded"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(meal.id)} aria-label="Delete meal" className="p-2 text-muted hover:text-danger focus-visible:ring-2 focus-visible:ring-golden-400 rounded"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
                {meal.notes && <p className="text-xs text-muted mt-2 pl-9">{meal.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Meal Modal */}
      <Modal open={!!editingMeal} onClose={() => setEditingMeal(null)} title="Edit Meal" position="center">
        <div>
          <label className="text-xs text-muted block mb-1">Cat</label>
          <select value={editCatId} onChange={e => setEditCatId(e.target.value)}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Food Name</label>
          <input type="text" value={editFoodName} onChange={e => setEditFoodName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Type (tap to select, can pick multiple)</label>
          <FoodTypeChips selected={editFoodTypes} onChange={setEditFoodTypes} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Meal Time</label>
          <select value={editMealTime} onChange={e => setEditMealTime(e.target.value)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snack">Snack</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Amount (grams)</label>
          <input type="number" placeholder="e.g., 85" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Notes</label>
          <textarea rows={2} placeholder="Optional notes..." value={editNotes} onChange={e => setEditNotes(e.target.value)} />
        </div>
        <button onClick={handleEditSave} disabled={editSaving || !editCatId || !editFoodName || editFoodTypes.length === 0} className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50">
          {editSaving ? "Saving..." : "Update"}
        </button>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Record"
        message="This meal record will be permanently removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
