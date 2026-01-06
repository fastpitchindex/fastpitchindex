"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
// TODO: Import supabase client when auth is implemented
// import { supabaseClient } from "@/lib/supabaseClient";

type SubscriptionRow = {
  status: string | null;
  current_period_end: string | null;
  plan_id: string | null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPro =
    subscription?.status &&
    ["active", "trialing"].includes(subscription.status) &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date());

  useEffect(() => {
    // TODO: Load subscription from Supabase
    // const load = async () => {
    //   setLoading(true);
    //   setError(null);
    //   // ... load subscription logic
    //   setLoading(false);
    // };
    // load();
    setLoading(false);
  }, []);

  if (loading) {
    return <p>Loading billing...</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-semibold">Billing</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="rounded-md border border-border p-4 space-y-2">
        <p>
          <strong>Status:</strong>{" "}
          {subscription?.status
            ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
            : "No subscription"}
        </p>
        <p>
          <strong>Plan:</strong>{" "}
          {subscription?.plan_id
            ? subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1)
            : "Free"}
        </p>
        <p>
          <strong>Current period end:</strong> {formatDate(subscription?.current_period_end)}
        </p>
      </div>
      {!isPro ? (
        <Button variant="primary">Upgrade</Button>
      ) : null}
    </div>
  );
}
