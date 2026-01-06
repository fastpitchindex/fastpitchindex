"use client";

import { useState, useEffect, use } from "react";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Link from "next/link";
import { fetchTournamentById, EventRow } from "@/lib/fetchTournaments";
import { formatDateRange, formatLongDate, formatMonthDayYear, sortDivisions, formatDivision, formatLevels, formatGamesGuaranteed, getDivisionLabel, formatMoney, formatLevel } from "@/lib/utils";
import Skeleton from "@/components/Skeleton";
import { 
  LuArrowLeft, 
  LuCalendarDays, 
  LuMapPin, 
  LuUsers, 
  LuLayers, 
  LuClock, 
  LuCheck, 
  LuExternalLink, 
  LuShare2, 
  LuRefreshCw 
} from "react-icons/lu";

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTournamentById(resolvedParams.id);
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
        } else {
          setEvent(result.event);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tournament");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <Layout>
        <section className="py-20 md:py-28">
          <Container>
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/2" />
          </Container>
        </section>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <section className="py-20 md:py-28">
          <Container className="flex flex-col items-center justify-center">
            <p className="text-foreground font-medium text-lg">Tournament not found</p>
            <p className="text-muted-foreground text-sm mt-1">{error || "Try another listing."}</p>
            <Link
              href="/tournaments"
              className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground h-10 px-5 py-2"
            >
              Back to Tournaments
            </Link>
          </Container>
        </section>
      </Layout>
    );
  }

  const locationLabel =
    event.city && event.state ? `${event.city}, ${event.state}` : event.location || event.state || "Location TBD";

  const divisions = event.divisions?.map(getDivisionLabel).filter(Boolean) || [];
  const levels = event.division_levels || [];

  const shareTournament = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.event_name,
        text: `Check out ${event.event_name} on Fastpitch Index`,
        url: window.location.href,
      });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Layout>
      <section
        className="gradient-hero pt-8 md:pt-10"
        style={{ paddingBottom: "2.5rem" }}
      >
        <Container>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <LuArrowLeft className="w-4 h-4" />
            Back to Results
          </Link>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 max-w-4xl">
            {event.event_name}
          </h1>
          <div className="flex flex-wrap gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <LuCalendarDays className="w-5 h-5 text-coral" />
              <span>{formatDateRange(event.start_date, event.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <LuMapPin className="w-5 h-5" />
              <span>{locationLabel}</span>
            </div>
          </div>
          {event.org_name && (
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Badge variant="org">{event.org_name}</Badge>
            </div>
          )}
        </Container>
      </section>

      <section className="py-3 md:py-4 -mt-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 md:p-8">
                {event.registration_deadline && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <LuClock className="w-4 h-4" />
                      <span className="text-sm font-medium">Registration Deadline</span>
                    </div>
                    <p className="text-foreground">{formatLongDate(event.registration_deadline)}</p>
                  </div>
                )}
                {event.division_rows && event.division_rows.length > 0 && (
                  <div className="mt-0">
                    <div className="overflow-x-auto">
                      {(() => {
                        const hasGateFee = event.division_rows?.some((division) => division.gate_fee !== null && division.gate_fee !== undefined);
                        return (
                          <table className="w-full text-left border border-border/70 rounded-lg overflow-hidden text-[12px] table-fixed">
                            <colgroup>
                              <col className={hasGateFee ? "w-2/5" : "w-1/2"} />
                              <col className={hasGateFee ? "w-1/5" : "w-1/4"} />
                              {hasGateFee ? <col className="w-1/5" /> : null}
                              <col className={hasGateFee ? "w-1/5" : "w-1/4"} />
                            </colgroup>
                            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/70">
                              <tr>
                                <th className="px-2 py-2 font-semibold whitespace-nowrap">Division</th>
                                <th className="px-2 py-2 font-semibold whitespace-nowrap">Entry</th>
                                {hasGateFee ? <th className="px-2 py-2 font-semibold whitespace-nowrap">Gate</th> : null}
                                <th className="px-2 py-2 font-semibold whitespace-nowrap">GG</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...event.division_rows].sort((a, b) => {
                                const aLabel = a.age ? formatDivision(a.age) : "";
                                const bLabel = b.age ? formatDivision(b.age) : "";
                                const aNum = Number(aLabel.replace(/U/i, "")) || 0;
                                const bNum = Number(bLabel.replace(/U/i, "")) || 0;
                                return aNum - bNum;
                              }).map((division) => {
                                const ageLabel = division.age ? formatDivision(division.age) : "";
                                const levelLabel = division.level ? formatLevel(String(division.level)) : "";
                                const label = [ageLabel, levelLabel].filter(Boolean).join(" ").trim() || "Division";
                                return (
                                  <tr
                                    key={division.division_fingerprint}
                                    className="border-b border-border/70 last:border-b-0"
                                  >
                                    <td className="px-2 py-2 truncate text-foreground">
                                      {label}
                                    </td>
                                    <td className="px-2 py-2 text-foreground whitespace-nowrap">{formatMoney(division.entry_fee)}</td>
                                    {hasGateFee ? (
                                      <td className="px-2 py-2 text-foreground whitespace-nowrap">{formatMoney(division.gate_fee)}</td>
                                    ) : null}
                                    <td className="px-2 py-2 text-foreground whitespace-nowrap">{formatGamesGuaranteed(division.games_guaranteed)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </Card>
              <Card className="p-6 shadow-card border border-border">
                <div className="space-y-4">
                  <a
                    href={event.source_url || "#"}
                    target={event.source_url ? "_blank" : undefined}
                    rel={event.source_url ? "noopener noreferrer" : undefined}
                    className={`block ${event.source_url ? "" : "pointer-events-none opacity-60"}`}
                    aria-disabled={!event.source_url}
                  >
                    <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-coral text-white hover:bg-coral-dark shadow-coral-glow h-12 px-6 w-full">
                      Visit Official Page
                      <LuExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={shareTournament}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground h-12 px-6 w-full"
                  >
                    <LuShare2 className="w-4 h-4" />
                    Share Tournament
                  </button>
                  {event.updated_at && (
                    <div className="text-xs text-muted-foreground text-center">
                      <p>Last updated: {formatMonthDayYear(event.updated_at)}</p>
                      <Link
                        href={`/contact?type=correction&event=${encodeURIComponent(event.event_id)}`}
                        className="text-secondary font-semibold hover:underline"
                      >
                        Report a correction
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="hidden lg:block" />
          </div>
        </Container>
      </section>
    </Layout>
  );
}
