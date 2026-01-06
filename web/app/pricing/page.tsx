"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Link from "next/link";

const freeCtaHref = "/";

export default function PricingPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // TODO: Replace with actual auth check when authentication is implemented
  const user = null;
  const proCtaHref = user ? "/account/billing" : "/login";

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash !== "#pro") return;
    const target = document.getElementById("pro");
    if (!target) return;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [pathname, searchParams]);

  return (
    <Layout>
      <Container className="py-12 md:py-16">
        <section className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold">Pricing</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Fastpitch Index helps teams, families, and coaches discover and plan youth fastpitch softball tournaments -- without digging through dozens of sites.
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            Free access includes upcoming tournaments in the next 45 days. Pro unlocks full-season visibility, alerts, and advanced planning tools.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Free Access</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Free</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="font-semibold text-foreground">Search youth fastpitch softball tournaments by:</li>
              <li>- Location, date, and age group</li>
              <li>- View full tournament details</li>
              <li>- Follow official registration links</li>
            </ul>
            <p className="text-sm font-semibold">
              Includes tournaments within the next 45 days
            </p>
            <div>
              <Link
                href={freeCtaHref}
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-secondary"
              >
                Start Searching
              </Link>
            </div>
          </div>

          <div
            className="rounded-xl border border-border bg-white p-6 shadow-card flex flex-col gap-4"
            id="pro"
            style={{ scrollMarginTop: "84px" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Pro Full-Season Access</h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">Pro</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Extended Tournament Access</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>- View tournaments beyond the 45-day window</li>
                  <li>- Browse full upcoming seasons</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Planning &amp; Organization</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>- Build and manage a season schedule</li>
                  <li>- Share season schedule with coaches and parents</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Alerts &amp; Notifications</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>- Email alerts when new tournaments match your criteria</li>
                  <li>- Notifications when new events are added for specific ages or locations</li>
                </ul>
              </div>
            </div>
            <div>
              <Link
                href={proCtaHref}
                className="inline-flex items-center justify-center rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Unlock Full-Season Access
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Pricing</h2>
            <p className="text-sm text-muted-foreground">
              Fastpitch Index Pro is offered as a monthly subscription.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Cancel anytime</li>
              <li>- No long-term commitment</li>
              <li>- Pricing details will be finalized at launch</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Payments &amp; Billing</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Payments are securely processed by Paddle</li>
              <li>- Subscriptions renew automatically unless canceled</li>
              <li>- You can manage or cancel your subscription at any time</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Who Fastpitch Index Is For</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Travel teams planning a full season</li>
              <li>- Families coordinating multi-weekend schedules</li>
              <li>- Anyone tired of fragmented, outdated tournament listings</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Questions?</h2>
            <p className="text-sm text-muted-foreground">
              If you have questions about pricing or access, contact us at:{" "}
              <a className="text-secondary font-semibold hover:underline" href="mailto:support@fastpitchindex.com">
                support@fastpitchindex.com
              </a>
            </p>
          </div>
        </section>
      </Container>
    </Layout>
  );
}
