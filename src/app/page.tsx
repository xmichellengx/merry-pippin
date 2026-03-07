"use client";

import { useState } from "react";
import {
  Heart,
  Scale,
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Cat as CatIcon,
} from "lucide-react";
import Link from "next/link";
import { mockCats, getCatWeights, getUpcomingRecords, mockFoodLogs } from "@/lib/mock-data";
import { format, differenceInDays, differenceInMonths } from "date-fns";

function getAge(dob: string | null) {
  if (!dob) return "Unknown";
  const months = differenceInMonths(new Date(), new Date(dob));
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
}

function getHealthSuggestions() {
  const upcoming = getUpcomingRecords();
  const suggestions: string[] = [];
  const today = new Date();

  for (const rec of upcoming) {
    if (!rec.next_due_date) continue;
    const daysUntil = differenceInDays(new Date(rec.next_due_date), today);
    const catName = mockCats.find(c => c.id === rec.cat_id)?.name ?? "Cat";
    if (daysUntil <= 30 && daysUntil >= 0) {
      suggestions.push(`${catName}'s ${rec.title} is due in ${daysUntil} days (${format(new Date(rec.next_due_date), "MMM d")})`);
    } else if (daysUntil < 0) {
      suggestions.push(`${catName}'s ${rec.title} is overdue by ${Math.abs(daysUntil)} days!`);
    }
  }

  for (const cat of mockCats) {
    const weights = getCatWeights(cat.id);
    if (weights.length >= 2) {
      const latest = weights[weights.length - 1];
      const prev = weights[weights.length - 2];
      const change = latest.weight_kg - prev.weight_kg;
      if (change > 0.5) {
        suggestions.push(`${cat.name} gained ${change.toFixed(1)}kg recently. Monitor food portions.`);
      } else if (change < -0.3) {
        suggestions.push(`${cat.name} lost ${Math.abs(change).toFixed(1)}kg. Consider a vet checkup.`);
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Both cats are looking healthy! Keep up the great care.");
    suggestions.push("Tip: British Shorthairs benefit from interactive play sessions to prevent obesity.");
  }

  return suggestions;
}

export default function Dashboard() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const suggestions = getHealthSuggestions();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayFood = mockFoodLogs.filter(f => f.date === todayStr);

  return (
    <div className="px-4 pt-12 space-y-5">
      {/* Header */}
      <div className="golden-gradient rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <CatIcon size={24} />
          <h1 className="text-xl font-bold">Paw Palace</h1>
        </div>
        <p className="text-white/80 text-sm">Merry & Pippin&apos;s Wellness Hub</p>
        <p className="text-white/60 text-xs mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Cat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {mockCats.map((cat) => {
          const weights = getCatWeights(cat.id);
          const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight_kg : null;
          const isActive = activeCat === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(isActive ? null : cat.id)}
              className={`card p-4 text-left transition-all ${
                isActive ? "ring-2 ring-golden-400 shadow-md" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full golden-gradient flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">{cat.name[0]}</span>
              </div>
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <p className="text-muted text-xs">{cat.color} {cat.breed}</p>
              <p className="text-muted text-xs">{getAge(cat.date_of_birth)}</p>
              {latestWeight && (
                <p className="text-golden-600 font-semibold text-sm mt-2">{latestWeight} kg</p>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Suggestions */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-golden-100 flex items-center justify-center">
            <Sparkles size={14} className="text-golden-600" />
          </div>
          <h2 className="font-semibold text-sm">Health Insights</h2>
        </div>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <AlertCircle size={14} className="text-golden-500 mt-0.5 shrink-0" />
              <p className="text-xs text-foreground/80 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/health" className="card p-3 text-center card-hover">
          <Heart size={20} className="text-danger mx-auto mb-1" />
          <p className="text-xs font-medium">Health</p>
          <p className="text-[10px] text-muted">
            {getUpcomingRecords().filter(r => {
              if (!r.next_due_date) return false;
              const d = differenceInDays(new Date(r.next_due_date), new Date());
              return d <= 30 && d >= 0;
            }).length} upcoming
          </p>
        </Link>
        <Link href="/weight" className="card p-3 text-center card-hover">
          <TrendingUp size={20} className="text-golden-500 mx-auto mb-1" />
          <p className="text-xs font-medium">Growth</p>
          <p className="text-[10px] text-muted">Track trends</p>
        </Link>
        <Link href="/food" className="card p-3 text-center card-hover">
          <UtensilsCrossed size={20} className="text-golden-700 mx-auto mb-1" />
          <p className="text-xs font-medium">Food</p>
          <p className="text-[10px] text-muted">{todayFood.length} meals today</p>
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-golden-600" />
            <h2 className="font-semibold text-sm">Upcoming</h2>
          </div>
          <Link href="/health" className="text-golden-600 text-xs font-medium flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {getUpcomingRecords().slice(0, 4).map((rec) => {
            const cat = mockCats.find(c => c.id === rec.cat_id);
            if (!rec.next_due_date) return null;
            const daysUntil = differenceInDays(new Date(rec.next_due_date), new Date());
            const isOverdue = daysUntil < 0;
            const isUrgent = daysUntil <= 14 && daysUntil >= 0;

            return (
              <div key={rec.id} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isOverdue ? "bg-danger" : isUrgent ? "bg-warning" : "bg-success"}`} />
                  <div>
                    <p className="text-xs font-medium">{rec.title}</p>
                    <p className="text-[10px] text-muted">{cat?.name} &middot; {rec.record_type}</p>
                  </div>
                </div>
                <span className={`badge ${isOverdue ? "badge-danger" : isUrgent ? "badge-warning" : "badge-success"}`}>
                  {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Food Summary */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-golden-600" />
            <h2 className="font-semibold text-sm">Today&apos;s Meals</h2>
          </div>
          <Link href="/food" className="text-golden-600 text-xs font-medium flex items-center gap-0.5">
            Log meal <ChevronRight size={12} />
          </Link>
        </div>
        {todayFood.length === 0 ? (
          <p className="text-xs text-muted">No meals logged yet today.</p>
        ) : (
          <div className="space-y-2">
            {todayFood.map((meal) => {
              const cat = mockCats.find(c => c.id === meal.cat_id);
              return (
                <div key={meal.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-xs font-medium">{meal.food_name}</p>
                    <p className="text-[10px] text-muted">{cat?.name} &middot; {meal.meal_time}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-info">{meal.food_type}</span>
                    {meal.amount_grams && (
                      <p className="text-[10px] text-muted mt-0.5">{meal.amount_grams}g</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
