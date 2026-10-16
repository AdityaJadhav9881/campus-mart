import { useCallback, useEffect, useState } from "react";
import { fetchStats } from "../api/client.js";
import { demoListings } from "../data/demoListings.js";

/* Home-page database counters.
   "live"    — counts returned by the backend stats endpoint
   "estimate"— listings are live, students derived from them
   "demo"    — backend unreachable, sample figures shown
   "loading" — first check still running                          */

export function useStats({ products, online, loading }) {
  const [stats, setStats] = useState(null);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    const result = await fetchStats();
    setStats(result);
    setChecking(false);
    return result;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  let mode = "estimate";
  if (stats) mode = "live";
  else if (loading) mode = "loading";
  else if (!online) mode = "demo";

  const listings =
    stats?.listings ??
    (loading ? null : online ? products.length : demoListings.length);

  const students =
    stats?.students ??
    (loading
      ? null
      : online
        ? Math.max(48, products.length * 6 + 48)
        : 1280);

  return { listings, students, mode, refresh, checking };
}
