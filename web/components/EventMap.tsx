"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { EventRow } from "@/lib/fetchTournaments";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// MapReopenHandler must be a child of MapContainer to use useMap hook
function MapReopenHandler({ onReopen }: { onReopen: () => void }) {
  if (typeof window === "undefined") return null;
  
  const { useMap } = require("react-leaflet");
  const map = useMap();
  
  useEffect(() => {
    const reopen = () => {
      onReopen();
    };
    map.on("popupclose", reopen);
    map.on("moveend", reopen);
    map.on("zoomend", reopen);
    map.on("load", reopen);
    return () => {
      map.off("popupclose", reopen);
      map.off("moveend", reopen);
      map.off("zoomend", reopen);
      map.off("load", reopen);
    };
  }, [map, onReopen]);
  return null;
}

const formatShortDateRange = (start?: string | null, end?: string | null) => {
  if (!start) return "";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.valueOf())) return "";
  const endDate = end ? new Date(end) : startDate;
  if (Number.isNaN(endDate.valueOf())) return "";
  const startText = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (startDate.toDateString() === endDate.toDateString()) return startText;
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  const endText = sameMonth
    ? endDate.toLocaleDateString("en-US", { day: "numeric" })
    : endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startText}-${endText}`;
};

// Create a custom coral-colored marker SVG matching Leaflet's default marker shape
// Coral color: hsl(12 76% 61%) = rgb(231, 110, 80) = #e76e50
function createCoralMarkerIcon() {
  // Standard Leaflet marker shape with coral color
  const svg = `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg"><path fill="#e76e50" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 7.5 12.5 28.5 12.5 28.5S25 20 25 12.5C25 5.596 19.404 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5.5"/></svg>`;
  // URL encode the SVG
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function EventMap({ events }: { events: EventRow[] }) {
  const mapRef = useRef<any>(null);
  const markerRefs = useRef(new Map<string, any>());
  const [selectedEventId, setSelectedEventId] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("returnToId") || "";
    }
    return "";
  });
  const [mapReady, setMapReady] = useState(false);
  const [iconsReady, setIconsReady] = useState(false);
  const [navyIcon, setNavyIcon] = useState<any>(null);
  const [coralIcon, setCoralIcon] = useState<any>(null);

  // Initialize Leaflet icons
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    import("leaflet").then((L) => {
      // Fix for default marker icon issue in Next.js
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Create custom navy (blue) icon
      const navy = new L.default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });

      // Create custom coral icon matching the search button color (hsl(12 76% 61%) = #F5825F)
      const coralIconUrl = createCoralMarkerIcon();
      const coral = new L.default.Icon({
        iconUrl: coralIconUrl,
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });

      setNavyIcon(navy);
      setCoralIcon(coral);
      setIconsReady(true);
    });
  }, []);

  const markers = useMemo(() => {
    return events.filter(
      (event) => Number.isFinite(event.latitude) && Number.isFinite(event.longitude)
    );
  }, [events]);

  const groupedMarkers = useMemo(() => {
    const groups = new Map<
      string,
      { key: string; latitude: number; longitude: number; events: EventRow[] }
    >();
    markers.forEach((event) => {
      const lat = event.latitude as number;
      const lon = event.longitude as number;
      const key = `${lat}|${lon}`;
      const existing = groups.get(key);
      if (existing) {
        existing.events.push(event);
      } else {
        groups.set(key, { key, latitude: lat, longitude: lon, events: [event] });
      }
    });
    return Array.from(groups.values());
  }, [markers]);

  const eventIdToGroupKey = useMemo(() => {
    const map = new Map<string, string>();
    groupedMarkers.forEach((group) => {
      group.events.forEach((event) => {
        map.set(event.event_id, group.key);
      });
    });
    return map;
  }, [groupedMarkers]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (groupedMarkers.length === 0) return [44.3148, -85.6024]; // Default to Michigan center
    const sum = groupedMarkers.reduce(
      (acc, item) => [acc[0] + item.latitude, acc[1] + item.longitude],
      [0, 0]
    );
    return [sum[0] / groupedMarkers.length, sum[1] / groupedMarkers.length];
  }, [groupedMarkers]);

  const openSelectedPopup = useCallback(() => {
    if (!selectedEventId || !mapRef.current) return false;
    const groupKey = eventIdToGroupKey.get(selectedEventId);
    if (!groupKey) return false;
    const marker = markerRefs.current.get(groupKey);
    if (!marker) return false;
    const latLng = marker.getLatLng();
    mapRef.current.invalidateSize({ animate: false });
    mapRef.current.setView(latLng, mapRef.current.getZoom(), { animate: false });
    marker.openPopup();
    return true;
  }, [eventIdToGroupKey, selectedEventId]);

  // Update marker icons when selection changes
  useEffect(() => {
    if (!mapReady || !navyIcon || !coralIcon) return;
    
    groupedMarkers.forEach((group) => {
      const marker = markerRefs.current.get(group.key);
      if (!marker) return;
      
      const isSelected = group.events.some((event) => event.event_id === selectedEventId);
      marker.setIcon(isSelected ? coralIcon : navyIcon);
    });
  }, [selectedEventId, groupedMarkers, mapReady, navyIcon, coralIcon]);

  useEffect(() => {
    if (!selectedEventId || !mapReady) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      const opened = openSelectedPopup();
      attempts += 1;
      if (opened || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [groupedMarkers.length, mapReady, openSelectedPopup, selectedEventId]);

  useEffect(() => {
    if (!mapReady) return;
    const storedId = sessionStorage.getItem("returnToId") || "";
    if (storedId && storedId !== selectedEventId) {
      setSelectedEventId(storedId);
    }
  }, [mapReady, selectedEventId]);

  // Clear selected location when events change (new search)
  useEffect(() => {
    if (!selectedEventId) return;
    
    // Check if the currently selected event is still in the events list
    const selectedEventExists = events.some((event) => event.event_id === selectedEventId);
    
    // If the selected event is no longer in the list, clear the selection
    if (!selectedEventExists) {
      setSelectedEventId("");
      sessionStorage.removeItem("returnToId");
    }
  }, [events, selectedEventId]);

  if (events.length === 0) return <div className="text-muted-foreground p-8 text-center">No events to show on the map.</div>;
  if (markers.length === 0) return <div className="text-muted-foreground p-8 text-center">No map coordinates available.</div>;
  if (!iconsReady || !navyIcon || !coralIcon) return <div className="text-muted-foreground p-8 text-center">Loading map...</div>;

  return (
    <div className="map-container" style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map: any) => {
          mapRef.current = map;
          setMapReady(true);
        }}
      >
        <MapReopenHandler onReopen={openSelectedPopup} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groupedMarkers.map((group) => {
          const isSelected = group.events.some((event) => event.event_id === selectedEventId);
          return (
            <Marker
              key={group.key}
              position={[group.latitude, group.longitude]}
              icon={isSelected ? coralIcon : navyIcon}
              ref={(ref: any) => {
                if (ref) {
                  markerRefs.current.set(group.key, ref);
                }
              }}
              eventHandlers={{
                click: () => {
                  mapRef.current?.closePopup();
                  const primary = group.events[0];
                  if (primary) {
                    sessionStorage.setItem("returnToId", primary.event_id);
                    setSelectedEventId(primary.event_id);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm font-semibold text-foreground mb-2">
                  {[group.events[0]?.city, group.events[0]?.state].filter(Boolean).join(", ")}
                </div>
                <div className="mt-3">
                  {group.events.map((event, index) => (
                    <div key={event.event_id} style={index > 0 ? { marginTop: "0.75rem" } : undefined}>
                      <Link
                        href={`/tournaments/${event.event_id}`}
                        onClick={() => {
                          sessionStorage.setItem("returnToId", event.event_id);
                          setSelectedEventId(event.event_id);
                        }}
                        className="text-foreground hover:text-secondary font-semibold"
                      >
                        {event.event_name}
                      </Link>
                      {event.start_date ? (
                        <div className="text-xs text-muted-foreground">
                          {formatShortDateRange(event.start_date, event.end_date)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
