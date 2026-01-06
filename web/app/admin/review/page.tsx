"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// TODO: Import supabase client
// import { supabaseClient } from "@/lib/supabaseClient";

type ReviewCandidate = {
  id: string;
  created_at: string;
  evidence_kind: string;
  extracted_json: Record<string, unknown> | null;
  admin_sources?: { name: string | null } | null;
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return date.toLocaleString();
};

const formatSummary = (payload: Record<string, unknown> | null) => {
  if (!payload) return "—";
  const event = payload.event as Record<string, unknown> | undefined;
  if (!event) return "—";
  const name = (event.event_name ?? event.name) as string | undefined;
  const start = event.start_date as string | undefined;
  const end = event.end_date as string | undefined;
  const raw = event.raw_date_text as string | undefined;
  const dateText = raw || [start, end].filter(Boolean).join(" - ");
  const parts = [name, dateText].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
};

export default function AdminReviewPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ReviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError(null);
      // TODO: Load candidates from Supabase
      // const { data, error: loadError } = await supabaseClient
      //   .from("admin_candidates")
      //   .select("id, created_at, evidence_kind, extracted_json, admin_sources ( name )")
      //   .eq("review_status", "pending")
      //   .order("created_at", { ascending: false })
      //   .limit(200);
      // if (loadError) {
      //   setError(loadError.message);
      //   setCandidates([]);
      // } else {
      //   setCandidates((data as ReviewCandidate[]) ?? []);
      // }
      setLoading(false);
    };

    loadCandidates();
  }, []);

  const summaries = useMemo(
    () => candidates.map((candidate) => formatSummary(candidate.extracted_json)),
    [candidates],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="text-sm text-muted-foreground">Pending candidate approvals.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading candidates...</p> : null}
      {!loading ? (
        <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No pending candidates.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-t border-border">
                    <td className="px-4 py-3">{formatTimestamp(candidate.created_at)}</td>
                    <td className="px-4 py-3">{candidate.admin_sources?.name ?? "—"}</td>
                    <td className="px-4 py-3">{candidate.evidence_kind}</td>
                    <td className="px-4 py-3">{summaries[index]}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1 text-xs font-semibold"
                        onClick={() => router.push(`/admin/review/${candidate.id}`)}
                      >
                        Review
                      </button>
                    </td>
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
