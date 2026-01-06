"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
// TODO: Import supabase client
// import { supabaseClient } from "@/lib/supabaseClient";

type AdminSource = {
  id: string;
  name: string;
  adapter_type: string;
  enabled: boolean;
  schedule_type: string | null;
  interval_minutes: number | null;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  adapter_type: string;
  enabled: boolean;
  schedule_type: string;
  interval_minutes: string;
  params: string;
};

const emptyForm: FormState = {
  name: "",
  adapter_type: "ocr",
  enabled: true,
  schedule_type: "manual",
  interval_minutes: "",
  params: "{}",
};

const adapterOptions = ["ocr", "usssa", "firecrawl", "other"];
const scheduleOptions = ["manual", "interval"];

const formatTimestamp = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return date.toLocaleString();
};

export default function AdminSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [runNowSourceId, setRunNowSourceId] = useState<string | null>(null);

  const paramsError = useMemo(() => {
    try {
      JSON.parse(formState.params);
      return null;
    } catch {
      return "Params must be valid JSON.";
    }
  }, [formState.params]);

  const loadSources = async () => {
    setLoading(true);
    setError(null);
    // TODO: Load sources from Supabase
    // const { data, error: loadError } = await supabaseClient
    //   .from("admin_sources")
    //   .select("*")
    //   .order("created_at", { ascending: false });
    // if (loadError) {
    //   setError(loadError.message);
    //   setSources([]);
    // } else {
    //   setSources((data as AdminSource[]) ?? []);
    // }
    setLoading(false);
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (paramsError) return;
    setSaving(true);
    // TODO: Create source in Supabase
    setFormState(emptyForm);
    setShowNew(false);
    await loadSources();
    setSaving(false);
  };

  const handleRunNow = async (sourceId: string) => {
    setRunNowSourceId(sourceId);
    setError(null);
    // TODO: Create run in Supabase
    setRunNowSourceId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sources</h1>
          <p className="text-sm text-muted-foreground">Manage ingestion sources.</p>
        </div>
        <Button variant="primary" onClick={() => setShowNew((prev) => !prev)}>
          {showNew ? "Close" : "New Source"}
        </Button>
      </div>

      {showNew ? (
        <form onSubmit={handleCreate} className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">
              <span>Name</span>
              <Input
                type="text"
                value={formState.name}
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                required
              />
            </label>
            <label className="space-y-1 text-sm font-semibold">
              <span>Adapter Type</span>
              <Select
                value={formState.adapter_type}
                onChange={(event) => setFormState({ ...formState, adapter_type: event.target.value })}
              >
                {adapterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={formState.enabled}
                onChange={(event) => setFormState({ ...formState, enabled: event.target.checked })}
              />
              <span>Enabled</span>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              <span>Schedule</span>
              <Select
                value={formState.schedule_type}
                onChange={(event) => setFormState({ ...formState, schedule_type: event.target.value })}
              >
                {scheduleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
            {formState.schedule_type === "interval" ? (
              <label className="space-y-1 text-sm font-semibold">
                <span>Interval Minutes</span>
                <Input
                  type="number"
                  min={1}
                  value={formState.interval_minutes}
                  onChange={(event) => setFormState({ ...formState, interval_minutes: event.target.value })}
                  required
                />
              </label>
            ) : null}
          </div>
          <label className="space-y-1 text-sm font-semibold">
            <span>Params (JSON)</span>
            <textarea
              rows={4}
              value={formState.params}
              onChange={(event) => setFormState({ ...formState, params: event.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
            {paramsError ? <span className="text-xs text-destructive">{paramsError}</span> : null}
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving || !!paramsError}>
              {saving ? "Saving..." : "Create Source"}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground"
              onClick={() => {
                setShowNew(false);
                setFormState(emptyForm);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading sources...</p> : null}

      {!loading ? (
        <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Adapter Type</th>
                <th className="px-4 py-3">Enabled</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Interval Minutes</th>
                <th className="px-4 py-3">Last Run</th>
                <th className="px-4 py-3">Next Run</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    No sources found.
                  </td>
                </tr>
              ) : (
                sources.map((source) => (
                  <tr
                    key={source.id}
                    className="cursor-pointer border-t border-border hover:bg-muted/30"
                    onClick={() => router.push(`/admin/sources/${source.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{source.name}</td>
                    <td className="px-4 py-3">{source.adapter_type}</td>
                    <td className="px-4 py-3">{source.enabled ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{source.schedule_type ?? "manual"}</td>
                    <td className="px-4 py-3">{source.interval_minutes ?? "—"}</td>
                    <td className="px-4 py-3">{formatTimestamp(source.last_run_at)}</td>
                    <td className="px-4 py-3">{formatTimestamp(source.next_run_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1 text-xs font-semibold"
                        disabled={runNowSourceId === source.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRunNow(source.id);
                        }}
                      >
                        {runNowSourceId === source.id ? "Running..." : "Run now"}
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
