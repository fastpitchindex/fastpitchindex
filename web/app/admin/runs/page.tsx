"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// TODO: Import supabase client
// import { supabaseClient } from "@/lib/supabaseClient";

type AdminRunRow = {
  id: string;
  source_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  counts: Record<string, unknown> | null;
  admin_sources?: { name: string | null } | null;
};

const formatTimestamp = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return date.toLocaleString();
};

const formatDuration = (start: string, end: string | null) => {
  if (!end) return "—";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) return "—";
  const seconds = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
};

const getCount = (counts: Record<string, unknown> | null, key: string) => {
  if (!counts) return 0;
  const value = counts[key];
  return typeof value === "number" ? value : 0;
};

export default function AdminRunsPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<AdminRunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRuns = async () => {
      setLoading(true);
      setError(null);
      // TODO: Load runs from Supabase
      // const { data, error: loadError } = await supabaseClient
      //   .from("admin_runs")
      //   .select("id, source_id, status, started_at, ended_at, counts, admin_sources ( name )")
      //   .order("started_at", { ascending: false })
      //   .limit(100);
      // if (loadError) {
      //   setError(loadError.message);
      //   setRuns([]);
      // } else {
      //   setRuns((data as AdminRunRow[]) ?? []);
      // }
      setLoading(false);
    };

    loadRuns();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Runs</h1>
        <p className="text-sm text-muted-foreground">Recent source runs.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading runs...</p> : null}
      {!loading ? (
        <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Candidates</th>
                <th className="px-4 py-3">Artifacts</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No runs found.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr
                    key={run.id}
                    className="cursor-pointer border-t border-border hover:bg-muted/30"
                    onClick={() => router.push(`/admin/runs/${run.id}`)}
                  >
                    <td className="px-4 py-3">{formatTimestamp(run.started_at)}</td>
                    <td className="px-4 py-3 font-medium">{run.status}</td>
                    <td className="px-4 py-3">{run.admin_sources?.name ?? "—"}</td>
                    <td className="px-4 py-3">{formatDuration(run.started_at, run.ended_at)}</td>
                    <td className="px-4 py-3">{getCount(run.counts, "candidates")}</td>
                    <td className="px-4 py-3">{getCount(run.counts, "artifacts")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
