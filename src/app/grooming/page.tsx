"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, Loader2, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { getCats, getGroomingLogs, addGroomingLog, deleteGroomingLog, GROOMING_TASKS } from "@/lib/data";
import type { Cat, GroomingLog } from "@/lib/supabase";
import { TwoCatsSitting } from "@/components/CatIllustrations";
import { useAdmin } from "@/components/AdminContext";

const taskIcons: Record<string, string> = {
  fur_brushing: "\uD83E\uDEB6",
  teeth_brushing: "\u2728",
  ear_cleaning: "\uD83D\uDC42",
  nail_cutting: "\u2702\uFE0F",
};

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
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const { isAdmin } = useAdmin();

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
      alert("Failed to save: " + (err instanceof Error ? err.message : String(err)));
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
    return <div className="flex flex-col items-center pt-40 gap-3"><TwoCatsSitting size={120} className="opacity-30" /><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Grooming</h1>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showHistory ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}
        >
          {showHistory ? "Tasks" : "History"}
        </button>
      </div>

      {/* Cat filter */}
      <div className="flex gap-2">
        <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === "all" ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>All</button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.id ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"}`}>{cat.name}</button>
        ))}
      </div>

      {!showHistory ? (
        /* Task checklist view */
        <div className="space-y-3">
          {GROOMING_TASKS.map(task => (
            <div key={task.type} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{taskIcons[task.type]}</span>
                <div>
                  <h3 className="text-sm font-semibold">{task.label}</h3>
                  <p className="text-[10px] text-muted">Every {task.frequencyDays} days</p>
                </div>
              </div>
              <div className="space-y-2">
                {filteredCats.map(cat => {
                  const { status, daysAgo, lastDate } = getTaskStatus(logs, cat.id, task.type, task.frequencyDays);
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
                          {status === "overdue" ? (daysAgo !== null ? `${daysAgo - task.frequencyDays}d late` : "Due") : status === "due" ? "Due today" : `${task.frequencyDays - (daysAgo ?? 0)}d left`}
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
          ))}
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
