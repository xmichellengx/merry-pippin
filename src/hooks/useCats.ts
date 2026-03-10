"use client";

import { useState, useEffect, useCallback } from "react";
import { getCats } from "@/lib/data";
import type { Cat } from "@/lib/supabase";

export function useCats() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const data = await getCats();
      setCats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cats, loading, refetch };
}
