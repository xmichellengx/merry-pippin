"use client";

import { useState } from "react";
import { ArrowLeft, Plus, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { mockCats, mockFoodLogs } from "@/lib/mock-data";
import { format, subDays } from "date-fns";

const foodTypeEmoji: Record<string, string> = {
  wet: "🥫",
  dry: "🥣",
  treat: "🍪",
  supplement: "💊",
};

const mealTimeOrder = ["breakfast", "lunch", "snack", "dinner"];

export default function FoodPage() {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredLogs = mockFoodLogs
    .filter(f => f.date === selectedDate && (selectedCat === "all" || f.cat_id === selectedCat))
    .sort((a, b) => mealTimeOrder.indexOf(a.meal_time) - mealTimeOrder.indexOf(b.meal_time));

  const totalGrams = filteredLogs.reduce((sum, f) => sum + (f.amount_grams ?? 0), 0);

  // Quick date picker (last 7 days)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return {
      value: format(d, "yyyy-MM-dd"),
      label: i === 0 ? "Today" : i === 1 ? "Yesterday" : format(d, "EEE"),
      date: format(d, "d"),
    };
  });

  return (
    <div className="px-4 pt-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Food Log</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {dates.map(d => (
          <button
            key={d.value}
            onClick={() => setSelectedDate(d.value)}
            className={`flex flex-col items-center min-w-[3.5rem] px-2 py-2 rounded-xl text-xs transition-colors ${
              selectedDate === d.value
                ? "golden-gradient text-white shadow-md"
                : "bg-golden-50 text-foreground/70"
            }`}
          >
            <span className="font-medium">{d.label}</span>
            <span className={`text-lg font-bold ${selectedDate === d.value ? "" : "text-foreground"}`}>{d.date}</span>
          </button>
        ))}
      </div>

      {/* Cat selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCat("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"
          }`}
        >
          All
        </button>
        {mockCats.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Summary */}
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
        {/* Breakdown by type */}
        <div className="flex gap-3 mt-3">
          {(["dry", "wet", "treat", "supplement"] as const).map(type => {
            const typeTotal = filteredLogs
              .filter(f => f.food_type === type)
              .reduce((s, f) => s + (f.amount_grams ?? 0), 0);
            if (typeTotal === 0) return null;
            return (
              <div key={type} className="flex items-center gap-1">
                <span className="text-sm">{foodTypeEmoji[type]}</span>
                <span className="text-[10px] text-muted">{typeTotal}g</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Log Meal</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select defaultValue="">
              <option value="" disabled>Select cat...</option>
              {mockCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Food Name</label>
            <input type="text" placeholder="e.g., Royal Canin British Shorthair" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Type</label>
              <select defaultValue="dry">
                <option value="dry">Dry Food</option>
                <option value="wet">Wet Food</option>
                <option value="treat">Treat</option>
                <option value="supplement">Supplement</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Meal Time</label>
              <select defaultValue="breakfast">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Amount (grams)</label>
            <input type="number" placeholder="e.g., 85" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md">
              Save Meal
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meal List */}
      {filteredLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <UtensilsCrossed size={32} className="text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No meals logged for this day.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md"
          >
            Log First Meal
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(meal => {
            const cat = mockCats.find(c => c.id === meal.cat_id);
            return (
              <div key={meal.id} className="card p-4 card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{foodTypeEmoji[meal.food_type]}</span>
                    <div>
                      <p className="text-sm font-medium">{meal.food_name}</p>
                      <p className="text-[10px] text-muted">
                        {cat?.name} &middot; {meal.meal_time.charAt(0).toUpperCase() + meal.meal_time.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {meal.amount_grams && (
                      <p className="text-sm font-semibold text-golden-600">{meal.amount_grams}g</p>
                    )}
                    <span className="badge badge-info">{meal.food_type}</span>
                  </div>
                </div>
                {meal.notes && (
                  <p className="text-xs text-muted mt-2 pl-9">{meal.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
