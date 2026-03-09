"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Loader2, Trash2, Check, Settings, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { getCats, getGroomingLogs, addGroomingLog, deleteGroomingLog, GROOMING_TASKS } from "@/lib/data";
import type { Cat, GroomingLog } from "@/lib/supabase";
import { useAdmin } from "@/components/AdminContext";

const taskIcons: Record<string, string> = {
  fur_brushing: "\uD83E\uDEB6",
  teeth_brushing: "\u2728",
  ear_cleaning: "\uD83D\uDC42",
  nail_cutting: "\u2702\uFE0F",
};

const FREQ_STORAGE_KEY = "grooming-frequencies";

function loadFrequencies(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(FREQ_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveFrequencies(freqs: Record<string, number>) {
  localStorage.setItem(FREQ_STORAGE_KEY, JSON.stringify(freqs));
}

function getTaskStatus(logs: GroomingLog[], catId: string, taskType: string, frequencyDays: number) {
  const lastLog = logs.find(l => l.cat_id === catId && l.task_type === taskType);
  if (!lastLog) return { status: "overdue" as const, daysAgo: null, lastDate: null };
  const daysAgo = differenceInDays(new Date(), new Date(lastLog.completed_at));
  if (daysAgo >= frequencyDays) return { status: "overdue" as const, daysAgo, lastDate: lastLog.completed_at };
  if (daysAgo >= frequencyDays - 1) return { status: "due" as const, daysAgo, lastDate: lastLog.completed_at };
  return { status: "done" as const, daysAgo, lastDate: lastLog.completed_at };
}

export default function GroomingPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [logs, setLogs] = useState<GroomingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [customFreqs, setCustomFreqs] = useState<Record<string, number>>({});
  const { isAdmin } = useAdmin();

  useEffect(() => { setCustomFreqs(loadFrequencies()); }, []);

  const getFrequency = useCallback((taskType: string, defaultDays: number) => {
    return customFreqs[taskType] ?? defaultDays;
  }, [customFreqs]);

  const updateFrequency = (taskType: string, days: number) => {
    const next = { ...customFreqs, [taskType]: days };
    setCustomFreqs(next);
    saveFrequencies(next);
  };

  const loadData = () => {
    Promise.all([getCats(), getGroomingLogs()])
      .then(([c, g]) => { setCats(c); setLogs(g); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkDone = async (catId: string, taskType: string) => {
    const key = `${catId}-${taskType}`;
    setSaving(key);
    try {
      await addGroomingLog({
        cat_id: catId,
        task_type: taskType,
        completed_at: format(new Date(), "yyyy-MM-dd"),
      });
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : JSON.stringify(err);
      alert("Failed to save: " + msg + "\n\nMake sure the grooming_logs table exists in Supabase.");
    } finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    await deleteGroomingLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const filteredCats = useMemo(() =>
    selectedCat === "all" ? cats : cats.filter(c => c.id === selectedCat),
    [cats, selectedCat]
  );

  if (loading) {
    return <div className="flex flex-col items-center pt-32 gap-3"><Image src="/loading-grooming.webp" alt="" width={180} height={180} priority className="opacity-80" /><Loader2 size={28} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Grooming</h1>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => { setShowSettings(!showSettings); setShowHistory(false); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showSettings ? "golden-gradient text-white shadow-md" : "bg-golden-50 text-golden-700"}`}
            >
              <Settings size={16} />
            </button>
          )}
          <button
            onClick={() => { setShowHistory(!showHistory); setShowSettings(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showHistory ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}
          >
            {showHistory ? "Tasks" : "History"}
          </button>
        </div>
      </div>

      {/* Cat filter */}
      {!showSettings && (
        <div className="flex gap-2">
          <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>All</button>
          {cats.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
          ))}
        </div>
      )}

      {showSettings ? (
        /* Frequency settings */
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Task Frequency</h2>
            <button onClick={() => setShowSettings(false)} className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center">
              <X size={14} className="text-golden-700" />
            </button>
          </div>
          <p className="text-[10px] text-muted">Set how often each grooming task should be done.</p>
          <div className="space-y-3">
            {GROOMING_TASKS.map(task => {
              const freq = getFrequency(task.type, task.frequencyDays);
              return (
                <div key={task.type} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{taskIcons[task.type]}</span>
                    <span className="text-sm font-medium">{task.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFrequency(task.type, Math.max(1, freq - 1))}
                      className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center text-golden-700 font-bold text-sm"
                    >-</button>
                    <span className="text-sm font-semibold w-12 text-center">{freq}d</span>
                    <button
                      onClick={() => updateFrequency(task.type, freq + 1)}
                      className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center text-golden-700 font-bold text-sm"
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !showHistory ? (
        /* Task checklist view */
        <div className="space-y-3">
          {GROOMING_TASKS.map(task => {
            const freq = getFrequency(task.type, task.frequencyDays);
            return (
              <div key={task.type} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{taskIcons[task.type]}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{task.label}</h3>
                    <p className="text-[10px] text-muted">Every {freq} days</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredCats.map(cat => {
                    const { status, daysAgo, lastDate } = getTaskStatus(logs, cat.id, task.type, freq);
                    const savingKey = `${cat.id}-${task.type}`;
                    return (
                      <div key={cat.id} className="flex items-center justify-between py-1.5 border-t border-card-border first:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status === "overdue" ? "bg-danger" : status === "due" ? "bg-warning" : "bg-success"}`} />
                          <div>
                            <p className="text-xs font-medium">{cat.name}</p>
                            <p className="text-[10px] text-muted">
                              {lastDate ? `Last: ${format(new Date(lastDate), "MMM d")} (${daysAgo}d ago)` : "Never done"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${status === "overdue" ? "badge-danger" : status === "due" ? "badge-warning" : "badge-success"}`}>
                            {status === "overdue" ? (daysAgo !== null ? `${daysAgo - freq}d late` : "Due") : status === "due" ? "Due today" : `${freq - (daysAgo ?? 0)}d left`}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleMarkDone(cat.id, task.type)}
                              disabled={saving === savingKey}
                              className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success hover:bg-success/20 disabled:opacity-50"
                            >
                              {saving === savingKey ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* History view */
        logs.length === 0 ? (
          <div className="card p-8 text-center">
            <Image src="/cat-face-icon.png" alt="cat" width={110} height={110} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm text-muted">Even hobbits need grooming, precious.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs
              .filter(l => selectedCat === "all" || l.cat_id === selectedCat)
              .slice(0, 30)
              .map(log => {
                const cat = cats.find(c => c.id === log.cat_id);
                const task = GROOMING_TASKS.find(t => t.type === log.task_type);
                return (
                  <div key={log.id} className="card p-3 card-hover">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{taskIcons[log.task_type] || "?"}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{task?.label || log.task_type}</p>
                        <p className="text-[10px] text-muted">{cat?.name} &middot; {format(new Date(log.completed_at), "MMM d, yyyy")}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDelete(log.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
                      )}
                    </div>
                    {log.notes && <p className="text-xs text-muted mt-1 pl-9">{log.notes}</p>}
                  </div>
                );
              })}
          </div>
        )
      )}
    </div>
  );
}
