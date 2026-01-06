"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { fetchTournaments, EventRow, fetchZipCodeCoordinates } from "@/lib/fetchTournaments";
import { getDivisionLabel } from "@/lib/utils";
import {
  formatDateRange,
  sortDivisions,
  formatDivision,
  formatDateBlock,
  formatWeekendRange,
  formatWeekendHeader,
  getWeekendStart,
  toLocalDateValue,
  parseLocalDate,
  formatAgeSelection,
  toAgeKey,
  formatMoney,
  formatGamesGuaranteed,
  getSeasonRange,
  hasWeekendBetween,
  eventOverlapsRange,
  getDistanceMiles,
  splitTitleParenthetical,
  formatLevel,
} from "@/lib/utils";
import { 
  LuChevronLeft, 
  LuChevronRight, 
  LuRefreshCw, 
  LuX 
} from "react-icons/lu";
import EventMap from "@/components/EventMap";

type Filters = {
  search: string;
  ageGroups: string[];
  locationMode: "state" | "radius";
  state: string;
  zip: string;
  radius: string;
  maxPrice: number;
  weekendStarts: string[];
  level: string;
  seasonKey: string;
  weekendsOnly: boolean;
};

function TournamentRow({
  event,
  selectedAgeGroups,
}: {
  event: EventRow;
  selectedAgeGroups: string[];
}) {
  const { monthLabel, dayLabel } = formatDateBlock(event.start_date, event.end_date);
  const locationText =
    event.city && event.state ? `${event.city}, ${event.state}` : event.state || event.city || "";

  const gamesLabel = event.games_guaranteed ? formatGamesGuaranteed(event.games_guaranteed) : "";
  const showGames = gamesLabel && gamesLabel !== "TBD";

  const metaParts = [locationText].filter(Boolean).join(" · ");

  const titleParts = splitTitleParenthetical(event.event_name);
  const costLabel = formatMoney(event.entry_fee);

  return (
    <Link
      href={`/tournaments/${event.event_id}`}
      className="results-row group flex w-full items-center gap-3 md:gap-6 px-4 md:px-6 py-3 min-h-[64px] hover:bg-muted/30 active:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-event-id={event.event_id}
    >
      <div className="results-row-date w-16 shrink-0 text-center self-center">
        <p className="results-row-date-month">{monthLabel}</p>
        <p className="results-row-date-day">{dayLabel}</p>
      </div>
      <div className="flex-1 min-w-0 self-center">
        <p className="results-row-title results-ellipsis">
          {titleParts.main}
          {titleParts.extra ? <span className="results-row-title-extra">{titleParts.extra}</span> : null}
        </p>
        <p className="results-row-meta results-ellipsis">{metaParts}</p>
      </div>
      <div className="results-row-right flex flex-col items-end w-24 self-center pl-2 md:pl-4">
        {showGames ? <p className="results-row-gg">{gamesLabel}</p> : null}
        <p className="results-row-price">{costLabel}</p>
      </div>
    </Link>
  );
}

export default function TournamentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageSize = 25;
  const [events, setEvents] = useState<EventRow[]>([]);
  const [hiddenEvents, setHiddenEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    ageGroups: [],
    locationMode: "radius",
    state: "",
    zip: "",
    radius: "",
    maxPrice: 1000,
    weekendStarts: [],
    level: "",
    seasonKey: "current",
    weekendsOnly: true,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchApplied, setSearchApplied] = useState(false);
  const [sortMode, setSortMode] = useState<"date" | "distance">("date");
  const [ageSectionOpen, setAgeSectionOpen] = useState(true);
  const [weekendSectionOpen, setWeekendSectionOpen] = useState(false);
  const [locationSectionOpen, setLocationSectionOpen] = useState(false);
  const [additionalFiltersOpen, setAdditionalFiltersOpen] = useState(false);
  const [sortSectionOpen, setSortSectionOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [page, setPage] = useState(1);
  const [zipCoords, setZipCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weekendMonth, setWeekendMonth] = useState(() => new Date());

  // TODO: Replace with actual auth check when authentication is implemented
  // Temporarily set to true for testing
  const isPro = true;

  // Fetch tournaments on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await fetchTournaments({ isPro });
        if (cancelled) return;
        if (result.error) {
          setFetchError(result.error);
          console.error("Error fetching tournaments:", result.error);
        } else {
          console.log("Fetched tournaments:", {
            total: result.items.length + result.hiddenItems.length,
            free: result.items.length,
            hidden: result.hiddenItems.length,
          });
          setEvents(result.items);
          setHiddenEvents(result.hiddenItems);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage = error instanceof Error ? error.message : "Failed to load tournaments";
          setFetchError(errorMessage);
          console.error("Exception fetching tournaments:", error);
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
  }, [isPro]);

  const divisionOptions = useMemo(() => {
    const values = new Set<string>();
    events.forEach((event) => {
      event.divisions?.forEach((division) => {
        // Extract just the age part, not the level
        const divisionObj = typeof division === "object" && division !== null ? division : null;
        const age = divisionObj?.age || divisionObj?.division_age || (typeof division === "string" ? division.split(/\s+/)[0] : null);
        if (age) {
          // Format the age (e.g., "8U", "10U", "HS")
          const formattedAge = formatDivision(age);
          if (formattedAge) values.add(formattedAge);
        }
      });
    });
    return sortDivisions(Array.from(values));
  }, [events]);

  const ageOptions = useMemo(() => {
    if (divisionOptions.length > 0) return divisionOptions;
    return ["8U", "9U", "10U", "11U", "12U", "13U", "14U", "16U", "18U", "HS"];
  }, [divisionOptions]);

  const selectedDivisionLabel = useMemo(() => {
    if (filters.ageGroups.length === 0) return "";
    return formatAgeSelection(filters.ageGroups);
  }, [filters.ageGroups]);

  const selectedWeekends = useMemo(() => {
    return filters.weekendStarts
      .map((value) => parseLocalDate(value))
      .filter((value): value is Date => Boolean(value));
  }, [filters.weekendStarts]);

  const weekendLabel = useMemo(() => {
    if (selectedWeekends.length === 0) return "Select weekend";
    if (selectedWeekends.length === 1) return formatWeekendRange(selectedWeekends[0]);
    return `${selectedWeekends.length} weekends`;
  }, [selectedWeekends]);

  const ageListText = useMemo(() => {
    if (filters.ageGroups.length === 0) return "";
    return sortDivisions(filters.ageGroups).map(formatDivision).join(", ");
  }, [filters.ageGroups]);

  const additionalFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.weekendStarts.length;
    if (filters.zip && filters.radius) count += 1;
    if (sortMode !== "date") count += 1;
    return count;
  }, [filters.radius, filters.weekendStarts.length, filters.zip, sortMode]);

  const prevAgeCountRef = useRef(filters.ageGroups.length);

  useEffect(() => {
    if (filters.ageGroups.length === 0) {
      setAgeSectionOpen(true);
    } else if (prevAgeCountRef.current === 0 && filters.ageGroups.length > 0) {
      setAgeSectionOpen(false);
    }
    prevAgeCountRef.current = filters.ageGroups.length;
  }, [filters.ageGroups.length]);

  useEffect(() => {
    if (filters.ageGroups.length > 0 && !searchApplied) {
      setSearchApplied(true);
      return;
    }
    if (filters.ageGroups.length === 0 && searchApplied) {
      setSearchApplied(false);
    }
  }, [filters.ageGroups.length, searchApplied]);

  const weekendDays = useMemo(() => {
    const view = new Date(weekendMonth.getFullYear(), weekendMonth.getMonth(), 1);
    const startOffset = view.getDay();
    const gridStart = new Date(view);
    gridStart.setDate(view.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, idx) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + idx);
      return {
        date,
        inMonth: date.getMonth() === weekendMonth.getMonth(),
      };
    });
  }, [weekendMonth]);

  const levelOptions = useMemo(() => {
    const values = new Set<string>();
    events.forEach((event) => {
      event.division_levels?.forEach((level) => {
        const label = formatLevel(String(level));
        if (label) values.add(label);
      });
    });
    values.add("Open");
    return Array.from(values).sort((a, b) => {
      if (a === "Open") return -1;
      if (b === "Open") return 1;
      return a.localeCompare(b);
    });
  }, [events]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.level) count += 1;
    if (filters.maxPrice !== 1000) count += 1;
    if (filters.locationMode === "radius" && filters.zip && filters.radius) count += 1;
    return count;
  }, [filters.level, filters.maxPrice, filters.search, filters.locationMode, filters.zip, filters.radius]);

  const applySearch = () => {
    setSearchApplied(true);
    setSearchOpen(false);
    setAgeSectionOpen(false);
    setAdditionalFiltersOpen(false);
    setWeekendSectionOpen(false);
    setLocationSectionOpen(false);
    setSortSectionOpen(false);
    setPage(1);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "fastpitch-search",
        JSON.stringify({
          filters,
          searchApplied: true,
        })
      );
    }
  };

  const seasonSummary = useMemo(() => {
    const season = getSeasonRange(filters.seasonKey, new Date());
    return `${season.label} | ${filters.weekendsOnly ? "Weekends" : "All days"}`;
  }, [filters.seasonKey, filters.weekendsOnly]);

  const locationSummary = useMemo(() => {
    if (filters.zip && filters.radius) return `Within ${filters.radius} mi`;
    return "All locations";
  }, [filters.radius, filters.zip]);

  const matchesFilters = useCallback(
    (event: EventRow) => {
      if (filters.ageGroups.length === 0) return false;
      const normalizedSelectedAges = filters.ageGroups.map(toAgeKey).filter(Boolean);
      const query = filters.search.trim().toLowerCase();
      if (filters.locationMode === "state" && filters.state && event.state !== filters.state) return false;
      if (filters.locationMode === "radius" && filters.zip && filters.radius) {
        if (!zipCoords) return false;
        if (event.latitude === null || event.latitude === undefined || event.longitude === null || event.longitude === undefined) {
          return false;
        }
        const distance = getDistanceMiles(
          { lat: zipCoords.lat, lon: zipCoords.lon },
          { lat: event.latitude, lon: event.longitude }
        );
        if (distance > Number(filters.radius)) return false;
      }
      if (
        normalizedSelectedAges.length > 0 &&
        !event.divisions?.some((division) => {
          // Extract just the age part for comparison (not the level)
          const divisionObj = typeof division === "object" && division !== null ? division : null;
          const age = divisionObj?.age || divisionObj?.division_age || (typeof division === "string" ? division.split(/\s+/)[0] : null);
          if (!age) return false;
          const ageKey = toAgeKey(age);
          return ageKey ? normalizedSelectedAges.includes(ageKey) : false;
        })
      ) {
        return false;
      }
      if (
        filters.level &&
        (!event.division_levels || !event.division_levels.some((level) => formatLevel(String(level)) === filters.level))
      ) {
        return false;
      }
      const eventStart = parseLocalDate(event.start_date);
      if (!eventStart) return false;
      const eventEnd = parseLocalDate(event.end_date) || eventStart;
      if (filters.weekendStarts.length > 0) {
        const matchesWeekend = filters.weekendStarts.some((value) => {
          const weekendStart = parseLocalDate(value);
          if (!weekendStart) return false;
          const weekendEnd = new Date(weekendStart);
          weekendEnd.setDate(weekendStart.getDate() + 2);
          return eventOverlapsRange(eventStart, eventEnd, weekendStart, weekendEnd);
        });
        if (!matchesWeekend) return false;
      } else {
        const season = getSeasonRange(filters.seasonKey, new Date());
        const rangeStart = season.start;
        const rangeEnd = season.end;
        if (!eventOverlapsRange(eventStart, eventEnd, rangeStart, rangeEnd)) return false;
        const overlapStart = eventStart > rangeStart ? eventStart : rangeStart;
        const overlapEnd = eventEnd < rangeEnd ? eventEnd : rangeEnd;
        if (filters.weekendsOnly && !hasWeekendBetween(overlapStart, overlapEnd)) return false;
      }
      if (event.entry_fee && event.entry_fee > filters.maxPrice) return false;

      if (!query) return true;
      const name = event.event_name?.toLowerCase() ?? "";
      const city = event.city?.toLowerCase() ?? "";
      const state = event.state?.toLowerCase() ?? "";
      const organizer = event.org_name?.toLowerCase() ?? "";
      return name.includes(query) || city.includes(query) || state.includes(query) || organizer.includes(query);
    },
    [filters, zipCoords]
  );

  const filteredEvents = useMemo(() => {
    if (filters.ageGroups.length === 0) return [];
    return events.filter(matchesFilters);
  }, [events, filters.ageGroups.length, matchesFilters]);

  const sortedEvents = useMemo(() => {
    if (filteredEvents.length === 0) return filteredEvents;
    const list = [...filteredEvents];
    if (sortMode === "distance") {
      if (!zipCoords) return list;
      list.sort((a, b) => {
        if (a.latitude === null || a.latitude === undefined || a.longitude === null || a.longitude === undefined) return 1;
        if (b.latitude === null || b.latitude === undefined || b.longitude === null || b.longitude === undefined) return -1;
        const aDistance = getDistanceMiles(
          { lat: zipCoords.lat, lon: zipCoords.lon },
          { lat: a.latitude, lon: a.longitude }
        );
        const bDistance = getDistanceMiles(
          { lat: zipCoords.lat, lon: zipCoords.lon },
          { lat: b.latitude, lon: b.longitude }
        );
        return aDistance - bDistance;
      });
      return list;
    }
    list.sort((a, b) => {
      const aStart = parseLocalDate(a.start_date)?.getTime() ?? 0;
      const bStart = parseLocalDate(b.start_date)?.getTime() ?? 0;
      if (aStart !== bStart) return aStart - bStart;
      return (a.event_name || "").localeCompare(b.event_name || "");
    });
    return list;
  }, [filteredEvents, sortMode, zipCoords]);

  const visibleEvents = searchApplied ? sortedEvents : [];

  const totalPages = Math.max(1, Math.ceil(visibleEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleEvents.slice(start, start + pageSize);
  }, [currentPage, pageSize, visibleEvents]);

  const groupedEvents = useMemo(() => {
    if (!searchApplied) return [];
    const groups = new Map<string, { start: Date; events: EventRow[] }>();
    pagedEvents.forEach((event) => {
      const startDate = parseLocalDate(event.start_date);
      if (!startDate) return;
      const weekendStart = getWeekendStart(startDate);
      const key = weekendStart.toISOString().slice(0, 10);
      if (!groups.has(key)) {
        groups.set(key, { start: weekendStart, events: [] });
      }
      groups.get(key)?.events.push(event);
    });
    const sortedGroups = Array.from(groups.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
    sortedGroups.forEach((group) => {
      group.events.sort((a, b) => {
        const aStart = parseLocalDate(a.start_date)?.getTime() ?? 0;
        const bStart = parseLocalDate(b.start_date)?.getTime() ?? 0;
        if (aStart !== bStart) return aStart - bStart;
        const aPrice = a.entry_fee ?? Number.POSITIVE_INFINITY;
        const bPrice = b.entry_fee ?? Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
    });
    return sortedGroups;
  }, [pagedEvents, searchApplied]);

  const clearFilters = () => {
    setFilters({
      ageGroups: [],
      locationMode: "radius",
      state: "",
      zip: "",
      radius: "",
      maxPrice: 1000,
      weekendStarts: [],
      level: "",
      seasonKey: "current",
      weekendsOnly: true,
      search: "",
    });
    setSearchApplied(false);
    setPage(1);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("fastpitch-search");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("fastpitch-context");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<typeof filters>;
      const locationMode = parsed.locationMode === "state" ? "radius" : parsed.locationMode;
      setFilters((current) => ({
        ...current,
        ageGroups: parsed.ageGroups?.length ? parsed.ageGroups : current.ageGroups,
        locationMode: locationMode || current.locationMode,
        state: "",
        zip: parsed.zip || "",
        radius: parsed.radius || "",
        seasonKey: parsed.seasonKey || current.seasonKey,
        weekendStarts: parsed.weekendStarts || current.weekendStarts,
        weekendsOnly: parsed.weekendsOnly ?? current.weekendsOnly,
      }));
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (filters.locationMode !== "radius") {
      setZipCoords(null);
      return;
    }
    const zip = filters.zip.trim();
    if (zip.length < 5) {
      setZipCoords(null);
      return;
    }
    
    let cancelled = false;
    
    (async () => {
      try {
        const coords = await fetchZipCodeCoordinates(zip);
        if (!cancelled && coords) {
          setZipCoords(coords);
        } else if (!cancelled) {
          setZipCoords(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching zip code coordinates:', error);
          setZipCoords(null);
        }
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [filters.locationMode, filters.zip]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "fastpitch-context",
      JSON.stringify({
        ageGroups: filters.ageGroups,
        locationMode: filters.locationMode,
        state: filters.state,
        zip: filters.zip,
        radius: filters.radius,
        seasonKey: filters.seasonKey,
        weekendStarts: filters.weekendStarts,
        weekendsOnly: filters.weekendsOnly,
      })
    );
  }, [filters.ageGroups, filters.locationMode, filters.state, filters.zip, filters.radius, filters.seasonKey, filters.weekendStarts, filters.weekendsOnly]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("fastpitch-search");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        filters?: typeof filters;
        searchApplied?: boolean;
        viewMode?: "list" | "map";
      };
      if (parsed.filters) {
        const locationMode = parsed.filters.locationMode === "state" ? "radius" : parsed.filters.locationMode;
        setFilters((current) => ({
          ...current,
          ...parsed.filters,
          locationMode: locationMode || current.locationMode,
          state: "",
          weekendStarts: parsed.filters.weekendStarts || [],
        }));
      }
      if (parsed.searchApplied) {
        setSearchApplied(true);
      }
      if (parsed.viewMode) {
        setViewMode(parsed.viewMode);
      } else if (parsed.searchApplied) {
        setViewMode("list");
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    const openSearch = searchParams.get("openSearch");
    if (openSearch === "true") {
      setSearchOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchApplied) return;
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      "fastpitch-search",
      JSON.stringify({
        filters,
        searchApplied: true,
        viewMode,
      })
    );
  }, [filters, searchApplied, viewMode]);

  useEffect(() => {
    if (!searchApplied) return;
    setPage(1);
  }, [filters, searchApplied]);

  return (
    <Layout>
      <section className="py-2 md:py-4 pb-24 md:pb-6">
        <Container>
          <div className="mb-2" />

          <div className="bg-background/90 backdrop-blur border border-border/70 rounded-2xl p-4 md:p-5 shadow-sm mb-4">
            <div className="space-y-5">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setAgeSectionOpen((open) => !open)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg text-foreground font-normal">
                    <span className="font-display font-normal">Age</span>
                    {filters.ageGroups.length > 0 ? ` - ${ageListText}` : ""}
                  </h3>
                  <LuChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform ${ageSectionOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {ageSectionOpen ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-auto">
                    {ageOptions.map((division) => {
                      const label = formatDivision(division);
                      const checked = filters.ageGroups.includes(division);
                      return (
                        <label
                          key={division}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer ${
                            checked ? "border-secondary bg-secondary text-white" : "border-border text-muted-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              setFilters((current) => {
                                const nextAgeGroups = checked
                                  ? current.ageGroups.filter((item) => item !== division)
                                  : [...current.ageGroups, division];
                                return {
                                  ...current,
                                  ageGroups: nextAgeGroups,
                                };
                              });
                            }}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAdditionalFiltersOpen((open) => !open)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-display text-lg text-muted-foreground">
                    Additional Filters
                    {additionalFiltersCount > 0 ? (
                      <span className="text-secondary">{` (${additionalFiltersCount})`}</span>
                    ) : null}
                  </h3>
                  <LuChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform ${additionalFiltersOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {additionalFiltersOpen ? (
                  <div className="space-y-5 rounded-lg border border-border bg-background p-3">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setWeekendSectionOpen((open) => !open)}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-display text-lg">
                          Weekend(s)
                          {filters.weekendStarts.length > 0 ? (
                            <span className="text-secondary">{` (${filters.weekendStarts.length})`}</span>
                          ) : null}
                        </h3>
                        <LuChevronRight
                          className={`w-5 h-5 text-muted-foreground transition-transform ${weekendSectionOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {weekendSectionOpen ? (
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="flex items-center justify-between mb-3">
                            <button
                              type="button"
                              onClick={() => setWeekendMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Previous month"
                            >
                              <LuChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-foreground">
                              {weekendMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeekendMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                              className="p-1 text-muted-foreground hover:text-foreground"
                              aria-label="Next month"
                            >
                              <LuChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {weekendDays
                              .filter((day) => day.inMonth && day.date.getDay() === 5)
                              .map((day) => {
                                const weekendStart = new Date(day.date);
                                const weekendKey = toLocalDateValue(weekendStart);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isPast = weekendStart < today;
                                const isSelected = filters.weekendStarts.includes(weekendKey);
                                return (
                                  <button
                                    type="button"
                                    key={weekendStart.toISOString()}
                                    disabled={isPast}
                                    onClick={() => {
                                      if (isPast) return;
                                      setFilters((current) => ({
                                        ...current,
                                        weekendStarts: current.weekendStarts.includes(weekendKey)
                                          ? current.weekendStarts.filter((item) => item !== weekendKey)
                                          : [...current.weekendStarts, weekendKey],
                                      }));
                                    }}
                                    className={`w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                                      isSelected
                                        ? "border-secondary bg-secondary text-white"
                                        : "border-border text-foreground hover:border-secondary/60"
                                    } ${isPast ? "cursor-not-allowed opacity-50 hover:border-border" : ""}`}
                                  >
                                    {formatWeekendHeader(weekendStart)}
                                  </button>
                                );
                              })}
                          </div>
                          {filters.weekendStarts.length > 0 ? (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Selected: {weekendLabel}
                            </div>
                          ) : null}
                          {filters.weekendStarts.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setFilters((current) => ({ ...current, weekendStarts: [] }))}
                              className="mt-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setLocationSectionOpen((open) => !open)}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-display text-lg">
                          Distance
                          {filters.zip && filters.radius ? <span className="text-secondary"> (1)</span> : null}
                        </h3>
                        <LuChevronRight
                          className={`w-5 h-5 text-muted-foreground transition-transform ${locationSectionOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {locationSectionOpen ? (
                        <div className="space-y-3 rounded-lg border border-border bg-background p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Zip code"
                              value={filters.zip}
                              onChange={(event) => setFilters((current) => ({ ...current, zip: event.target.value }))}
                              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                            <select
                              value={filters.radius}
                              onChange={(event) => setFilters((current) => ({ ...current, radius: event.target.value }))}
                              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value="">Within range of</option>
                              {["50", "100", "150", "200", "250", "500"].map((option) => (
                                <option key={option} value={option}>
                                  {option} miles
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setSortSectionOpen((open) => !open)}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-display text-lg">Sort</h3>
                        <LuChevronRight
                          className={`w-5 h-5 text-muted-foreground transition-transform ${sortSectionOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {sortSectionOpen ? (
                        <div className="rounded-lg border border-border bg-background p-3">
                          <select
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as "date" | "distance")}
                            disabled={!filters.zip}
                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <option value="date">Date (Weekends)</option>
                            <option value="distance">Distance (Zip required)</option>
                          </select>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={applySearch}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold ${
                    filters.ageGroups.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                      : "bg-coral text-white pointer-events-auto"
                  }`}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {!searchApplied ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-xl">
              <p className="text-foreground font-medium text-lg">Select an age to see tournaments</p>
            </div>
          ) : filters.ageGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-xl">
              <p className="text-foreground font-medium text-lg">Select an age group to see tournaments</p>
              <button
                type="button"
                onClick={() => setAgeOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-secondary transition-colors"
              >
                Choose Ages
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LuRefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
              <p className="text-foreground font-medium text-lg">Loading tournaments...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-foreground font-medium text-lg">Error loading tournaments</p>
              <p className="text-muted-foreground text-sm mt-1">{fetchError}</p>
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-muted/50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-3xl">?</span>
              </div>
              <p className="text-foreground font-medium text-lg">No tournaments found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your filters to find more results
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <p className="text-sm text-muted-foreground">
                  Search returned {visibleEvents.length} tournaments
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      viewMode === "list" ? "bg-secondary text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      viewMode === "map" ? "bg-secondary text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Map
                  </button>
                </div>
              </div>
              {viewMode === "map" ? (
                <div className="border border-border rounded-2xl bg-card overflow-hidden md:mx-1">
                  <EventMap events={pagedEvents} />
                </div>
              ) : sortMode === "distance" ? (
                <div className="border border-border rounded-2xl bg-card overflow-hidden md:mx-1">
                  {pagedEvents.map((event) => (
                    <TournamentRow key={event.event_id} event={event} selectedAgeGroups={filters.ageGroups} />
                  ))}
                </div>
              ) : (
                <div className="border border-border rounded-2xl bg-card overflow-hidden md:mx-1">
                  {groupedEvents.map((group, index) => (
                    <div key={group.start.toISOString()} className={index > 0 ? "border-t border-border" : ""}>
                      <div className="px-4 md:px-6 py-1 results-weekend-header border-b border-border/60">
                        {formatWeekendHeader(group.start)}
                      </div>
                      <div>
                        {group.events.map((event) => (
                          <TournamentRow key={event.event_id} event={event} selectedAgeGroups={filters.ageGroups} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {ageOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="bg-card w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl">Select Ages</h3>
              <button type="button" onClick={() => setAgeOpen(false)} className="text-muted-foreground hover:text-foreground">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[45vh] overflow-auto">
              {divisionOptions.map((division) => {
                const label = formatDivision(division);
                const checked = filters.ageGroups.includes(division);
                return (
                  <label
                    key={division}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer ${
                      checked ? "border-secondary bg-secondary text-white" : "border-border text-muted-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => {
                        setFilters((current) => {
                          const nextAgeGroups = checked
                            ? current.ageGroups.filter((item) => item !== division)
                            : [...current.ageGroups, division];
                          return {
                            ...current,
                            ageGroups: nextAgeGroups,
                          };
                        });
                      }}
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setAgeOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {seasonOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="bg-card w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl">Season & Dates</h3>
              <button type="button" onClick={() => setSeasonOpen(false)} className="text-muted-foreground hover:text-foreground">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "current", label: "Current Season" },
                  { key: "fall", label: "Fall" },
                  { key: "winter", label: "Winter" },
                  { key: "spring", label: "Spring" },
                  { key: "summer", label: "Summer" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        seasonKey: item.key,
                        weekendStarts: [],
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      filters.seasonKey === item.key ? "border-secondary text-secondary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={filters.weekendsOnly}
                  onChange={(event) => setFilters((current) => ({ ...current, weekendsOnly: event.target.checked }))}
                />
                Weekends only
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSeasonOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {filtersOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="bg-card w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl">More Filters</h3>
              <button type="button" onClick={() => setFiltersOpen(false)} className="text-muted-foreground hover:text-foreground">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <select
                value={filters.level}
                onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value }))}
                className={`flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  filters.level ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <option value="">All Levels</option>
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Max Entry Fee</span>
                  <span>${filters.maxPrice}{filters.maxPrice >= 1000 ? "+" : ""}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="25"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
                  className="w-full accent-[hsl(var(--secondary))]"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-between items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
