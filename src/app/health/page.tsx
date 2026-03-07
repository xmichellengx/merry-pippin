"use client";

import { useState } from "react";
import {
  Syringe,
  Bug,
  Stethoscope,
  Pill,
  Plus,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { mockCats, getCatHealth } from "@/lib/mock-data";
import { format, differenceInDays } from "date-fns";
import type { HealthRecord } from "@/lib/supabase";

const typeConfig: Record<string, { icon: typeof Syringe; color: string; bg: string }> = {
  vaccine: { icon: Syringe, color: "text-blue-600", bg: "bg-blue-50" },
  deworm: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50" },
  vet_visit: { icon: Stethoscope, color: "text-green-600", bg: "bg-green-50" },
  medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50" },
  other: { icon: Stethoscope, color: "text-gray-600", bg: "bg-gray-50" },
};

function RecordCard({ record }: { record: HealthRecord }) {
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
            <span className="text-[10px] text-muted">{format(new Date(record.date), "MMM d, yyyy")}</span>
          </div>
          {record.description && (
            <p className="text-xs text-muted mt-0.5">{record.description}</p>
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
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const records = selectedCat === "all"
    ? mockCats.flatMap(c => getCatHealth(c.id))
    : getCatHealth(selectedCat);

  const filtered = filterType === "all"
    ? records
    : records.filter(r => r.record_type === filterType);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="px-4 pt-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Health Records</h1>
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

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {["all", "vaccine", "deworm", "vet_visit", "medication"].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === type ? "bg-foreground text-white" : "bg-golden-50 text-foreground/70"
            }`}
          >
            {type === "all" ? "All Types" : type === "vet_visit" ? "Vet Visit" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">New Health Record</h3>
          <div>
            <label className="text-xs text-muted block mb-1">Cat</label>
            <select defaultValue="">
              <option value="" disabled>Select cat...</option>
              {mockCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Type</label>
            <select defaultValue="vaccine">
              <option value="vaccine">Vaccine</option>
              <option value="deworm">Deworming</option>
              <option value="vet_visit">Vet Visit</option>
              <option value="medication">Medication</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Title</label>
            <input type="text" placeholder="e.g., FVRCP Vaccine" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Next Due Date</label>
            <input type="date" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea rows={2} placeholder="Optional notes..." />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md">
              Save Record
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

      {/* Records list */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted text-sm">No records found.</p>
          </div>
        ) : (
          sorted.map(record => (
            <RecordCard key={record.id} record={record} />
          ))
        )}
      </div>
    </div>
  );
}
