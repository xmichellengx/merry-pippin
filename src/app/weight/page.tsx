"use client";

import { useState } from "react";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { mockCats, getCatWeights } from "@/lib/mock-data";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function WeightPage() {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // Build chart data
  const allDates = new Set<string>();
  mockCats.forEach(cat => {
    getCatWeights(cat.id).forEach(w => allDates.add(w.recorded_at));
  });

  const chartData = Array.from(allDates)
    .sort()
    .map(date => {
      const entry: Record<string, string | number> = {
        date: format(new Date(date), "MMM yy"),
      };
      mockCats.forEach(cat => {
        const w = getCatWeights(cat.id).find(w => w.recorded_at === date);
        if (w) entry[cat.name] = w.weight_kg;
      });
      return entry;
    });

  const colors = ["#E8932B", "#D97A1E"];

  return (
    <div className="px-4 pt-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Weight Tracker</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {/* Cat selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCat("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"
          }`}
        >
          Compare
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

      {/* Growth Chart */}
      <div className="card p-4">
        <h2 className="font-semibold text-sm mb-3">Growth Chart</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8D8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9C8B7A" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9C8B7A" unit="kg" />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #F3E8D8",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {mockCats
                .filter(c => selectedCat === "all" || selectedCat === c.id)
                .map((cat, i) => (
                  <Line
                    key={cat.id}
                    type="monotone"
                    dataKey={cat.name}
                    stroke={colors[i]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: colors[i] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Log Weight</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select defaultValue="">
              <option value="" disabled>Select cat...</option>
              {mockCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Weight (kg)</label>
            <input type="number" step="0.01" placeholder="e.g., 4.5" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md">
              Save Weight
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

      {/* Weight Cards per cat */}
      {mockCats
        .filter(c => selectedCat === "all" || selectedCat === c.id)
        .map(cat => {
          const weights = getCatWeights(cat.id);
          const latest = weights[weights.length - 1];
          const prev = weights.length >= 2 ? weights[weights.length - 2] : null;
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
                      <span className="text-[10px] font-medium">
                        {isGain ? "+" : ""}{change.toFixed(2)} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini weight history */}
              <div className="space-y-1">
                {weights.slice(-5).reverse().map(w => (
                  <div key={w.id} className="flex justify-between text-xs py-1 border-b border-card-border last:border-0">
                    <span className="text-muted">{format(new Date(w.recorded_at), "MMM d, yyyy")}</span>
                    <span className="font-medium">{w.weight_kg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
