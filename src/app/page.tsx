"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart,
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Cat as CatIcon,
  Loader2,
  Pencil,
  Camera,
  X,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { getCats, getWeightRecords, getHealthRecords, getFoodLogs, updateCat } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Cat, WeightRecord, HealthRecord, FoodLog } from "@/lib/supabase";
import { TwoCatsSitting, CatSleeping } from "@/components/CatIllustrations";

function getAge(dob: string | null) {
  if (!dob) return "Unknown age";
  const months = differenceInMonths(new Date(), new Date(dob));
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
}

function buildSuggestions(cats: Cat[], weights: WeightRecord[], health: HealthRecord[]) {
  const suggestions: string[] = [];
  const today = new Date();

  for (const rec of health) {
    if (!rec.next_due_date) continue;
    const daysUntil = differenceInDays(new Date(rec.next_due_date), today);
    const catName = cats.find(c => c.id === rec.cat_id)?.name ?? "Cat";
    if (daysUntil <= 30 && daysUntil >= 0) {
      suggestions.push(`${catName}'s ${rec.title} is due in ${daysUntil} days (${format(new Date(rec.next_due_date), "MMM d")})`);
    } else if (daysUntil < 0) {
      suggestions.push(`${catName}'s ${rec.title} is overdue by ${Math.abs(daysUntil)} days!`);
    }
  }

  for (const cat of cats) {
    const catWeights = weights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
    if (catWeights.length >= 2) {
      const latest = catWeights[catWeights.length - 1];
      const prev = catWeights[catWeights.length - 2];
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

function EditCatModal({ cat, onClose, onSaved }: { cat: Cat; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(cat.name);
  const [breed, setBreed] = useState(cat.breed);
  const [color, setColor] = useState(cat.color);
  const [dob, setDob] = useState(cat.date_of_birth ?? "");
  const [photoUrl, setPhotoUrl] = useState(cat.photo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `cat-${cat.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);

    if (uploadError) {
      // Fallback to data URL if storage not set up
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    setPhotoUrl(publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCat(cat.id, {
        name,
        breed,
        color,
        date_of_birth: dob || null,
        photo_url: photoUrl || null,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center">
            <X size={16} className="text-muted" />
          </button>
        </div>

        {/* Photo */}
        <div className="flex justify-center">
          <button onClick={() => fileRef.current?.click()} className="relative group">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-golden-200" />
            ) : (
              <div className="w-24 h-24 rounded-full golden-gradient flex items-center justify-center border-4 border-golden-200">
                <span className="text-white font-bold text-3xl">{name[0] || "?"}</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-golden-500 flex items-center justify-center shadow-md border-2 border-white">
              {uploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-muted block mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Cat name" />
        </div>

        {/* Breed & Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Breed</label>
            <input type="text" value={breed} onChange={e => setBreed(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Color</label>
            <input type="text" value={color} onChange={e => setColor(e.target.value)} />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="text-xs text-muted block mb-1">Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="flex-1 py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [todayFood, setTodayFood] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);

  const loadData = () => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    Promise.all([getCats(), getWeightRecords(), getHealthRecords(), getFoodLogs(todayStr)])
      .then(([c, w, h, f]) => { setCats(c); setWeights(w); setHealth(h); setTodayFood(f); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <CatSleeping size={120} className="opacity-30" />
        <Loader2 size={32} className="text-golden-500 animate-spin" />
      </div>
    );
  }

  const suggestions = buildSuggestions(cats, weights, health);
  const upcoming = health.filter(h => h.next_due_date).sort((a, b) => (a.next_due_date ?? '').localeCompare(b.next_due_date ?? ''));

  return (
    <div className="px-4 pt-12 space-y-5">
      {/* Header */}
      <div className="golden-gradient rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <CatIcon size={24} />
            <h1 className="text-xl font-bold">Merry & Pippin</h1>
          </div>
          <p className="text-white/80 text-sm">Growth Tracker</p>
          <p className="text-white/60 text-xs mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="absolute -right-2 -bottom-2 opacity-20">
          <TwoCatsSitting size={140} />
        </div>
      </div>

      {/* Cat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cats.map((cat) => {
          const catWeights = weights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
          const latestWeight = catWeights.length > 0 ? catWeights[catWeights.length - 1].weight_kg : null;

          return (
            <button
              key={cat.id}
              onClick={() => setEditingCat(cat)}
              className="card p-4 text-left transition-all active:scale-[0.98]"
            >
              <div className="relative">
                {cat.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.photo_url} alt={cat.name} className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-golden-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full golden-gradient flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-sm">{cat.name[0]}</span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-golden-100 flex items-center justify-center">
                  <Pencil size={10} className="text-golden-600" />
                </div>
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

      {/* Edit Cat Modal */}
      {editingCat && (
        <EditCatModal
          cat={editingCat}
          onClose={() => setEditingCat(null)}
          onSaved={loadData}
        />
      )}

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
            {upcoming.filter(r => {
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
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-2">
              <CatSleeping size={100} className="opacity-40 mb-1" />
              <p className="text-xs text-muted">No upcoming events.</p>
            </div>
          ) : upcoming.slice(0, 4).map((rec) => {
            const cat = cats.find(c => c.id === rec.cat_id);
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
          <div className="flex flex-col items-center py-2">
            <CatSleeping size={90} className="opacity-30 mb-1" />
            <p className="text-xs text-muted">No meals logged yet today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayFood.map((meal) => {
              const cat = cats.find(c => c.id === meal.cat_id);
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
