"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

function hashContext(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export function AiInsights({
  cacheKey,
  title,
  prompt,
  context,
  loadingText = "Analyzing...",
}: {
  cacheKey: string;
  title: string;
  prompt: string;
  context: string;
  loadingText?: string;
}) {
  const CACHE_DATA = `ai_${cacheKey}`;
  const CACHE_HASH = `ai_${cacheKey}_hash`;

  const contextHash = hashContext(context);

  const cachedInsights = (() => {
    try {
      return localStorage.getItem(CACHE_DATA) || "";
    } catch { return ""; }
  })();
  const cachedHash = (() => {
    try {
      return localStorage.getItem(CACHE_HASH) || "";
    } catch { return ""; }
  })();

  // Show any cached result immediately (even if stale), only show spinner if no cache at all
  const [insights, setInsights] = useState<string>(cachedInsights);
  const [loading, setLoading] = useState(!cachedInsights);
  const [refreshing, setRefreshing] = useState(false);
  const fetchedHash = useRef(cachedHash === contextHash ? contextHash : "");

  useEffect(() => {
    if (!context || fetchedHash.current === contextHash) return;
    fetchedHash.current = contextHash;
    // Only show spinner if we have nothing cached; otherwise silently refresh
    if (!insights) setLoading(true);
    setRefreshing(true);

    fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, context }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.reply) {
          setInsights(data.reply);
          try {
            localStorage.setItem(CACHE_DATA, data.reply);
            localStorage.setItem(CACHE_HASH, contextHash);
          } catch { /* storage full */ }
        } else {
          setInsights("Could not generate insights right now.");
        }
      })
      .catch(() => { if (!insights) setInsights("Could not connect to AI."); })
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [context, contextHash, prompt]);

  if (!context) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-golden-100 flex items-center justify-center">
          <Sparkles size={14} className="text-golden-600" />
        </div>
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-golden-50 text-golden-600 font-medium">AI</span>
        {refreshing && !loading && <Loader2 size={12} className="animate-spin text-golden-400 ml-auto" />}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-golden-500" />
          <span className="text-xs text-muted">{loadingText}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {insights
            .split("\n")
            .filter(l => l.trim())
            .map(line => line.replace(/^[-•*]\s*/, "").replace(/#{1,4}\s*/g, "").replace(/\*{1,2}/g, "").trim())
            .filter(l => l.length > 0)
            .map((line, i) => (
              <div key={i} className="flex gap-2 items-start">
                <AlertCircle size={14} className="text-golden-500 mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">{line}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
