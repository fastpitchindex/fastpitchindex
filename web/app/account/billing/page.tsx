"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";

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
  const { user, session } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPro =
    subscription?.status &&
    ["active", "trialing"].includes(subscription.status) &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date());

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!session) {
          setError("Not authenticated.");
          setLoading(false);
          return;
        }

        const supabaseUrl = typeof window !== 'undefined' 
          ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
              ? `http://${window.location.hostname}:54321`
              : 'http://127.0.0.1:54321')
          : 'http://127.0.0.1:54321';
        
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${user.id}&select=status,current_period_end,plan_id&limit=1`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSubscription(data[0]);
          } else {
            // No subscription found
            setSubscription(null);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to load subscription.");
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError("Failed to load subscription.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user, router]);

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
