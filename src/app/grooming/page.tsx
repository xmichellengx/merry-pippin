"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Loader2, Trash2, Check, Settings, X, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { getCats, getGroomingLogs, addGroomingLog, deleteGroomingLog, getGroomingTasks, addGroomingTask, updateGroomingTask, deleteGroomingTask } from "@/lib/data";
import type { Cat, GroomingLog, GroomingTask } from "@/lib/supabase";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/Toast";

const ICON_OPTIONS = ["🪶", "✨", "👂", "✂️", "🧴", "🛁", "🐾", "💅", "🪥", "👃", "👁️", "💊"];

function getTaskStatus(logs: GroomingLog[], catId: string, taskType: string, frequencyDays: number) {
  const lastLog = logs.find(l => l.cat_id === catId && l.task_type === taskType);
  if (!lastLog) return { status: "overdue" as const, daysAgo: null, lastDate: null };
  const daysAgo = differenceInDays(new Date(), new Date(lastLog.completed_at));
  if (daysAgo >= frequencyDays) return { status: "overdue" as const, daysAgo, lastDate: lastLog.completed_at };
  if (daysAgo >= frequencyDays - 1 && daysAgo > 0) return { status: "due" as const, daysAgo, lastDate: lastLog.completed_at };
  return { status: "done" as const, daysAgo, lastDate: lastLog.completed_at };
}

export default function GroomingPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [logs, setLogs] = useState<GroomingLog[]>([]);
  const [tasks, setTasks] = useState<GroomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<GroomingTask | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [newFreq, setNewFreq] = useState(7);
  const { isAdmin } = useAdmin();
  const { showToast } = useToast();

  const loadData = () => {
    Promise.all([getCats(), getGroomingLogs(), getGroomingTasks()])
      .then(([c, g, t]) => { setCats(c); setLogs(g); setTasks(t); })
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
      showToast("Failed to save: " + msg);
    } finally { setSaving(null); }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Delete this grooming log?")) return;
    await deleteGroomingLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleAddTask = async () => {
    if (!newLabel.trim()) return;
    setSaving("add-task");
    try {
      const type = newLabel.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      await addGroomingTask({ type, label: newLabel.trim(), icon: newIcon, frequency_days: newFreq });
      setShowAddTask(false);
      setNewLabel("");
      setNewIcon("✨");
      setNewFreq(7);
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      showToast("Failed to add task: " + msg);
    } finally { setSaving(null); }
  };

  const handleUpdateTask = async (task: GroomingTask, updates: Partial<Pick<GroomingTask, "label" | "icon" | "frequency_days">>) => {
    try {
      await updateGroomingTask(task.id, updates);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updates } : t));
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      showToast("Failed to update: " + msg);
    }
  };

  const handleDeleteTask = async (task: GroomingTask) => {
    if (!confirm(`Delete "${task.label}"? This won't delete existing logs.`)) return;
    try {
      await deleteGroomingTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      if (editingTask?.id === task.id) setEditingTask(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      showToast("Failed to delete: " + msg);
    }
  };

  const filteredCats = useMemo(() =>
    selectedCat === "all" ? cats : cats.filter(c => c.id === selectedCat),
    [cats, selectedCat]
  );

  if (loading) {
    return <div className="flex flex-col items-center pt-32 gap-3"><Image src="/loading-grooming.webp" alt="" width={180} height={180} priority className="opacity-80" /><Loader2 size={28} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSettings || showHistory ? (
            <button onClick={() => { setShowSettings(false); setShowHistory(false); setEditingTask(null); setShowAddTask(false); }} className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></button>
          ) : (
            <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          )}
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
        /* Settings: manage tasks */
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Manage Tasks</h2>
            <button onClick={() => { setShowSettings(false); setEditingTask(null); setShowAddTask(false); }} className="w-7 h-7 rounded-full bg-golden-50 flex items-center justify-center">
              <X size={14} className="text-golden-700" />
            </button>
          </div>
          <p className="text-[10px] text-muted">Add, edit, or remove grooming tasks and set their frequency.</p>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id}>
                {editingTask?.id === task.id ? (
                  /* Editing inline */
                  <div className="p-3 bg-golden-50/50 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={editingTask.label}
                        onChange={e => setEditingTask({ ...editingTask, label: e.target.value })}
                        className="flex-1 text-sm font-medium bg-white rounded-lg px-3 py-1.5 border border-card-border"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setEditingTask({ ...editingTask, icon })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${editingTask.icon === icon ? "bg-golden-200 ring-2 ring-golden-400" : "bg-white"}`}
                        >{icon}</button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Frequency</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTask({ ...editingTask, frequency_days: Math.max(1, editingTask.frequency_days - 1) })}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-golden-700 font-bold text-sm border border-card-border"
                        >-</button>
                        <span className="text-sm font-semibold w-10 text-center">{editingTask.frequency_days}d</span>
                        <button
                          onClick={() => setEditingTask({ ...editingTask, frequency_days: editingTask.frequency_days + 1 })}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-golden-700 font-bold text-sm border border-card-border"
                        >+</button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleUpdateTask(task, { label: editingTask.label, icon: editingTask.icon, frequency_days: editingTask.frequency_days });
                          setEditingTask(null);
                        }}
                        className="flex-1 py-1.5 rounded-full golden-gradient text-white text-xs font-medium"
                      >Save</button>
                      <button onClick={() => setEditingTask(null)} className="px-3 py-1.5 rounded-full bg-white text-xs font-medium border border-card-border">Cancel</button>
                      <button onClick={() => handleDeleteTask(task)} className="px-3 py-1.5 rounded-full text-xs font-medium text-danger bg-danger/10">Delete</button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center justify-between py-2.5 border-b border-card-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{task.icon}</span>
                      <div>
                        <span className="text-sm font-medium">{task.label}</span>
                        <p className="text-[10px] text-muted">Every {task.frequency_days} days</p>
                      </div>
                    </div>
                    <button onClick={() => setEditingTask({ ...task })} className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center text-golden-700">
                      <Pencil size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new task */}
          {showAddTask ? (
            <div className="p-3 bg-golden-50/50 rounded-xl space-y-3">
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Task name..."
                className="w-full text-sm bg-white rounded-lg px-3 py-1.5 border border-card-border"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${newIcon === icon ? "bg-golden-200 ring-2 ring-golden-400" : "bg-white"}`}
                  >{icon}</button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Frequency</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNewFreq(Math.max(1, newFreq - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-golden-700 font-bold text-sm border border-card-border">-</button>
                  <span className="text-sm font-semibold w-10 text-center">{newFreq}d</span>
                  <button onClick={() => setNewFreq(newFreq + 1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-golden-700 font-bold text-sm border border-card-border">+</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  disabled={!newLabel.trim() || saving === "add-task"}
                  className="flex-1 py-1.5 rounded-full golden-gradient text-white text-xs font-medium disabled:opacity-50"
                >{saving === "add-task" ? "Adding..." : "Add Task"}</button>
                <button onClick={() => { setShowAddTask(false); setNewLabel(""); }} className="px-3 py-1.5 rounded-full bg-white text-xs font-medium border border-card-border">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-golden-200 text-golden-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-golden-50/50 transition-colors"
            >
              <Plus size={14} /> Add Grooming Task
            </button>
          )}

          {/* Done button */}
          <button
            onClick={() => { setShowSettings(false); setEditingTask(null); setShowAddTask(false); loadData(); }}
            className="w-full py-2.5 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md"
          >
            Done
          </button>
        </div>
      ) : !showHistory ? (
        /* Task checklist view */
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{task.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold">{task.label}</h3>
                  <p className="text-[10px] text-muted">Every {task.frequency_days} days</p>
                </div>
              </div>
              <div className="space-y-2">
                {filteredCats.map(cat => {
                  const { status, daysAgo, lastDate } = getTaskStatus(logs, cat.id, task.type, task.frequency_days);
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
                          {status === "overdue" ? (daysAgo !== null ? `${daysAgo - task.frequency_days}d late` : "Due") : status === "due" ? "Due today" : `${task.frequency_days - (daysAgo ?? 0)}d left`}
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
          {tasks.length === 0 && (
            <div className="card p-8 text-center">
              <Image src="/loading-grooming.webp" alt="No tasks" width={100} height={93} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm text-muted mb-3">&quot;The ring awaits a bearer...&quot; Add some grooming tasks!</p>
              {isAdmin && (
                <button onClick={() => setShowSettings(true)} className="px-4 py-2 rounded-full golden-gradient text-white text-xs font-medium">
                  <Plus size={14} className="inline mr-1" /> Add Tasks
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* History view */
        logs.length === 0 ? (
          <div className="card p-8 text-center">
            <Image src="/loading-grooming.webp" alt="No history" width={100} height={93} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm text-muted">&quot;My precious...&quot; No grooming history yet. Time to pamper!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs
              .filter(l => selectedCat === "all" || l.cat_id === selectedCat)
              .slice(0, 30)
              .map(log => {
                const cat = cats.find(c => c.id === log.cat_id);
                const task = tasks.find(t => t.type === log.task_type);
                return (
                  <div key={log.id} className="card p-3 card-hover">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{task?.icon || "?"}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{task?.label || log.task_type}</p>
                        <p className="text-[10px] text-muted">{cat?.name} &middot; {format(new Date(log.completed_at), "MMM d, yyyy")}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDeleteLog(log.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
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
