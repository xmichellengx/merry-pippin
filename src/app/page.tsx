"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  UtensilsCrossed,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Cat as CatIcon,
  Loader2,
  Pencil,
  Camera,
  X,
  Send,
  Bot,
  Lock,
  Unlock,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { getCats, getWeightRecords, getHealthRecords, getFoodLogs, updateCat } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Cat, WeightRecord, HealthRecord, FoodLog } from "@/lib/supabase";
import { TwoCatsSitting, CatSleeping } from "@/components/CatIllustrations";
import { useAdmin } from "@/components/AdminContext";

function getAge(dob: string | null) {
  if (!dob) return "Unknown age";
  const months = differenceInMonths(new Date(), new Date(dob));
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
}

function AiHealthInsights({ context }: { context: string }) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !context) return;
    hasFetched.current = true;

    // Check localStorage cache (24-hour TTL)
    const CACHE_KEY = "ai_health_insights";
    const CACHE_TS_KEY = "ai_health_insights_ts";
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTs = localStorage.getItem(CACHE_TS_KEY);
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (cached && cachedTs && Date.now() - parseInt(cachedTs) < ONE_DAY) {
      setInsights(cached);
      setLoading(false);
      return;
    }

    fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Give me a brief health summary for my cats. Highlight any upcoming vaccines/deworming due, weight trends, and any concerns. Keep it to 3-5 bullet points, each one sentence. Use bullet points with dashes.",
        context,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.reply) {
          setInsights(data.reply);
          localStorage.setItem(CACHE_KEY, data.reply);
          localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        } else {
          setInsights("Could not generate insights right now. Check back later!");
        }
      })
      .catch(() => setInsights("Could not connect to AI. Check back later!"))
      .finally(() => setLoading(false));
  }, [context]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-golden-100 flex items-center justify-center">
          <Sparkles size={14} className="text-golden-600" />
        </div>
        <h2 className="font-semibold text-sm">Health Insights</h2>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-golden-50 text-golden-600 font-medium">AI</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-golden-500" />
          <span className="text-xs text-muted">Analyzing your cats&apos; health data...</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {insights.split("\n").filter(l => l.trim()).map((line, i) => (
            <div key={i} className="flex gap-2 items-start">
              <AlertCircle size={14} className="text-golden-500 mt-0.5 shrink-0" />
              <p className="text-xs text-foreground/80 leading-relaxed">{line.replace(/^[-•*]\s*/, "")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AiMessage = { role: "user" | "assistant"; text: string };

function AiChatCard({ context }: { context: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How much should a BSH kitten eat?",
    "When is the next vaccine due?",
    "Tips for healthy weight gain",
    "How to groom British Shorthairs?",
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AiMessage = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), context }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't get a response. Try again!" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Oops! Something went wrong. Try again later." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
          <Bot size={14} className="text-purple-600" />
        </div>
        <h2 className="font-semibold text-sm">Ask AI About Your Cats</h2>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-500 font-medium">ChatGPT</span>
      </div>

      {messages.length === 0 ? (
        <div className="space-y-2 mb-3">
          <p className="text-xs text-muted">Ask me anything about cat care, nutrition, health, or your cats!</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-medium hover:bg-purple-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="max-h-60 overflow-y-auto space-y-2.5 mb-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-golden-500 text-white rounded-br-md"
                  : "bg-purple-50 text-foreground rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 px-3 py-2 rounded-2xl rounded-bl-md">
                <Loader2 size={14} className="animate-spin text-purple-400" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask about your cats..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
          className="flex-1 text-xs !py-2 !px-3 !rounded-xl"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-xl golden-gradient flex items-center justify-center shadow-sm disabled:opacity-40"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function EditCatModal({ cat, onClose, onSaved }: { cat: Cat; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(cat.name);
  const [breed, setBreed] = useState(cat.breed);
  const [color, setColor] = useState(cat.color);
  const [dob, setDob] = useState(cat.date_of_birth ?? "");
  const [gender, setGender] = useState(cat.gender ?? "");
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
        gender: gender || null,
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

        {/* Gender */}
        <div>
          <label className="text-xs text-muted block mb-1">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Not set</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
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
  const [showMenu, setShowMenu] = useState(false);
  const { isAdmin, logout, setShowPinModal } = useAdmin();

  const loadData = () => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    Promise.all([getCats(), getWeightRecords(), getHealthRecords(), getFoodLogs(todayStr)])
      .then(([c, w, h, f]) => { setCats(c); setWeights(w); setHealth(h); setTodayFood(f); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const upcoming = useMemo(() =>
    health.filter(h => h.next_due_date).sort((a, b) => (a.next_due_date ?? '').localeCompare(b.next_due_date ?? '')),
    [health]
  );

  // Build context for AI chat (memoized to prevent re-renders)
  const aiContext = useMemo(() => [
    ...cats.map(cat => {
      const catWeights = weights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
      const latestWeight = catWeights.length > 0 ? catWeights[catWeights.length - 1] : null;
      const catHealth = health.filter(h => h.cat_id === cat.id);
      return `Cat: ${cat.name}, Breed: ${cat.breed}, Color: ${cat.color}, DOB: ${cat.date_of_birth || "unknown"}, Age: ${getAge(cat.date_of_birth)}${latestWeight ? `, Latest weight: ${latestWeight.weight_kg}kg (${latestWeight.recorded_at})` : ""}${catHealth.length > 0 ? `, Recent health: ${catHealth.slice(0, 5).map(h => `${h.title} on ${h.date}${h.next_due_date ? ` (next due: ${h.next_due_date})` : ""}`).join("; ")}` : ""}`;
    }),
    `Today's meals: ${todayFood.length > 0 ? todayFood.map(f => `${f.food_name} (${f.food_type}, ${f.amount_grams || "?"}g) for ${cats.find(c => c.id === f.cat_id)?.name || "cat"}`).join("; ") : "none logged yet"}`,
  ].join("\n"), [cats, weights, health, todayFood]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <CatSleeping size={120} className="opacity-30" />
        <Loader2 size={32} className="text-golden-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 space-y-5">
      {/* Header */}
      <div className="golden-gradient rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CatIcon size={24} />
              <h1 className="text-xl font-bold">Merry & Pippin</h1>
            </div>
            <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Menu size={18} />
            </button>
          </div>
          <p className="text-white/80 text-sm">Growth Tracker</p>
          <p className="text-white/60 text-xs mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="absolute -right-2 -bottom-2 opacity-20">
          <TwoCatsSitting size={140} />
        </div>
        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-14 right-4 z-20 bg-white rounded-xl shadow-lg border border-card-border py-1 min-w-[140px]">
            <button
              onClick={() => { setShowMenu(false); isAdmin ? logout() : setShowPinModal(true); }}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground flex items-center gap-2 hover:bg-golden-50"
            >
              {isAdmin ? <Unlock size={15} className="text-golden-600" /> : <Lock size={15} className="text-muted" />}
              {isAdmin ? "Log out" : "Meowmeee Login"}
            </button>
          </div>
        )}
      </div>

      {/* Cat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cats.map((cat) => {
          const catWeights = weights.filter(w => w.cat_id === cat.id).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
          const latestWeight = catWeights.length > 0 ? catWeights[catWeights.length - 1].weight_kg : null;

          return (
            <button
              key={cat.id}
              onClick={() => isAdmin && setEditingCat(cat)}
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
                {isAdmin && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-golden-100 flex items-center justify-center">
                    <Pencil size={10} className="text-golden-600" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <p className="text-muted text-xs">{cat.gender ? `${cat.gender === "male" ? "♂" : "♀"} ` : ""}{cat.color} {cat.breed}</p>
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

      {/* AI Health Insights */}
      <AiHealthInsights context={aiContext} />

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

      {/* AI Chat */}
      <AiChatCard context={aiContext} />
    </div>
  );
}
