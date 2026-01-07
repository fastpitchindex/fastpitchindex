"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { sanitizeText } from "@/lib/utils";
// TODO: Import supabase client when auth is implemented
// import { supabaseClient } from "@/lib/supabaseClient";

type AlertRow = {
  id: string;
  name: string;
  criteria: Record<string, unknown> | null;
  frequency: string;
  is_active: boolean;
  created_at: string;
};

type AlertFormState = {
  name: string;
  query: string;
  state: string;
  date_from: string;
  date_to: string;
};

const initialForm: AlertFormState = {
  name: "",
  query: "",
  state: "",
  date_from: "",
  date_to: "",
};

function formatCriteria(criteria: Record<string, unknown> | null) {
  if (!criteria) return "None";
  const parts: string[] = [];
  if (typeof criteria.query === "string" && criteria.query) {
    parts.push(`Query: ${criteria.query}`);
  }
  if (typeof criteria.state === "string" && criteria.state) {
    parts.push(`State: ${criteria.state}`);
  }
  if (typeof criteria.date_from === "string" && criteria.date_from) {
    parts.push(`From: ${criteria.date_from}`);
  }
  if (typeof criteria.date_to === "string" && criteria.date_to) {
    parts.push(`To: ${criteria.date_to}`);
  }
  return parts.length ? parts.join(" | ") : "None";
}

export default function AlertsPage() {
  const { isPro, isProLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [form, setForm] = useState<AlertFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isProLoading && !isPro) {
      router.push("/account/profile");
    }
  }, [isPro, isProLoading, router]);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    // TODO: Load alerts from Supabase
    // const { data, error: loadError } = await supabaseClient
    //   .from("alerts")
    //   .select("id,name,criteria,frequency,is_active,created_at")
    //   .order("created_at", { ascending: false });
    // if (loadError) {
    //   setError(loadError.message);
    // } else {
    //   setAlerts(data ?? []);
    // }
    setLoading(false);
  };

  useEffect(() => {
    if (isPro && !isProLoading) {
      loadAlerts();
    }
  }, [isPro, isProLoading]);

  const handleChange = (field: keyof AlertFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    // Sanitize all inputs
    const sanitizedName = sanitizeText(form.name, 200);
    const sanitizedQuery = form.query ? sanitizeText(form.query, 500) : "";
    const sanitizedState = form.state ? sanitizeText(form.state, 2) : "";

    const criteria: Record<string, string> = {};
    if (sanitizedQuery) criteria.query = sanitizedQuery;
    if (sanitizedState) criteria.state = sanitizedState;
    if (form.date_from) criteria.date_from = form.date_from; // Date inputs are already validated by HTML5
    if (form.date_to) criteria.date_to = form.date_to; // Date inputs are already validated by HTML5

    // TODO: Create alert in Supabase
    // const { error: createError } = await supabaseClient.from("alerts").insert({
    //   user_id: user.id,
    //   name: sanitizedName,
    //   criteria,
    //   frequency: "daily",
    //   is_active: true,
    // });

    setMessage("Alert created.");
    setForm(initialForm);
    await loadAlerts();
    setSaving(false);
  };

  const toggleActive = async (alert: AlertRow) => {
    // TODO: Update alert in Supabase
    // const { error: updateError } = await supabaseClient
    //   .from("alerts")
    //   .update({ is_active: !alert.is_active })
    //   .eq("id", alert.id);
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === alert.id ? { ...item, is_active: !item.is_active } : item,
      ),
    );
  };

  const deleteAlert = async (alertId: string) => {
    // TODO: Delete alert from Supabase
    // const { error: deleteError } = await supabaseClient
    //   .from("alerts")
    //   .delete()
    //   .eq("id", alertId);
    setAlerts((prev) => prev.filter((item) => item.id !== alertId));
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <form onSubmit={handleCreate} className="space-y-4 border border-border rounded-md p-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Alert name</span>
            <Input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Query</span>
            <Input
              type="text"
              value={form.query}
              onChange={handleChange("query")}
              placeholder="Spring Slam"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">State</span>
            <Input
              type="text"
              value={form.state}
              onChange={handleChange("state")}
              placeholder="MI"
              maxLength={2}
            />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Date from</span>
              <Input
                type="date"
                value={form.date_from}
                onChange={handleChange("date_from")}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Date to</span>
              <Input
                type="date"
                value={form.date_to}
                onChange={handleChange("date_to")}
              />
            </label>
          </div>
          <div className="text-sm text-muted-foreground">Frequency: daily</div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Creating..." : "Create alert"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your alerts</h3>
        {loading ? <p>Loading alerts...</p> : null}
        {!loading && alerts.length === 0 ? <p>No alerts yet.</p> : null}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-border rounded-md p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{alert.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCriteria(alert.criteria)}
                  </p>
                </div>
                <span className="text-sm">
                  {alert.is_active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  className="underline"
                  onClick={() => toggleActive(alert)}
                >
                  {alert.is_active ? "Pause" : "Resume"}
                </button>
                <button
                  className="underline text-red-600"
                  onClick={() => deleteAlert(alert.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
