"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geography,
  Marker,
  useGeographies,
} from "react-simple-maps";
import {
  DEFAULT_GERMANY_LOCATIONS,
  GERMANY_GEO_URL,
  GERMANY_STATE_HOVER_STROKE,
  GERMANY_STATE_STROKE,
  MARKER_COLORS,
  STATE_FILL_PALETTE,
} from "../../../lib/germanyMapConstants";

const MAP_WIDTH = 800;
const MAP_HEIGHT = 520;
const MAP_CENTER = [10.45, 51.16];
const FIXED_ZOOM = 0.7;
const MAP_PROJECTION_SCALE = 2900 * FIXED_ZOOM;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getStateFill(name) {
  const index = hashString(name || "de") % STATE_FILL_PALETTE.length;
  return STATE_FILL_PALETTE[index];
}

function getStateName(geo) {
  const props = geo.properties || {};
  return props.GEN || props.name || props.NAME_1 || geo.id || "Germany";
}

function MapPin({ color, isActive }) {
  return (
    <g
      className={`germany-map-pin ${isActive ? "germany-map-pin--active" : ""}`}
      style={{ "--pin-color": color }}
    >
      <circle className="germany-map-pin-glow" r={18} fill={color} />
      <circle className="germany-map-pin-ring" r={10} fill="none" stroke={color} />
      <path
        className="germany-map-pin-head"
        d="M0,-14 C4,-8 6,-2 0,4 C-6,-2 -4,-8 0,-14 Z"
        fill={color}
      />
      <circle className="germany-map-pin-core" r={3.5} fill="#fff" />
    </g>
  );
}

function GermanyStates({ geographies = [] }) {
  return geographies.map((geo) => {
    const name = getStateName(geo);
    const fill = getStateFill(name);

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        className="germany-map-state"
        style={{
          default: {
            fill,
            stroke: GERMANY_STATE_STROKE,
            strokeWidth: 1,
            outline: "none",
            transition: "fill 300ms ease, stroke 300ms ease, filter 300ms ease",
          },
          hover: {
            fill,
            stroke: GERMANY_STATE_HOVER_STROKE,
            strokeWidth: 1.35,
            outline: "none",
            filter: "brightness(0.97)",
          },
          pressed: {
            fill,
            outline: "none",
          },
        }}
      />
    );
  });
}

function GermanyMapLayers({ markers, activeId, setActiveId, onGeoReady }) {
  const { geographies } = useGeographies({ geography: GERMANY_GEO_URL });

  useEffect(() => {
    if (geographies?.length > 0) {
      onGeoReady();
    }
  }, [geographies, onGeoReady]);

  return (
    <>
      <GermanyStates geographies={geographies} />

      {markers.map((marker) => {
        const isActive = activeId === marker.id;

        return (
          <Marker key={marker.id} coordinates={marker.coordinates}>
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActiveId(marker.id)}
              onMouseLeave={() =>
                setActiveId((prev) => (prev === marker.id ? null : prev))
              }
              onFocus={() => setActiveId(marker.id)}
              onBlur={() =>
                setActiveId((prev) => (prev === marker.id ? null : prev))
              }
              onClick={() =>
                setActiveId((prev) => (prev === marker.id ? null : marker.id))
              }
              role="button"
              tabIndex={0}
              aria-label={`${marker.city}, ${marker.state}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveId((prev) => (prev === marker.id ? null : marker.id));
                }
              }}
            >
              <circle r={22} fill="transparent" className="germany-map-hit-area" />
              <MapPin color={marker.color} isActive={isActive} />
              {isActive && (
                <LocationTooltip
                  city={marker.city}
                  state={marker.state}
                  color={marker.color}
                />
              )}
            </g>
          </Marker>
        );
      })}
    </>
  );
}

function LocationTooltip({ city, state, color }) {
  return (
    <foreignObject
      x={14}
      y={-58}
      width={200}
      height={80}
      className="overflow-visible pointer-events-none"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="germany-map-tooltip"
        style={{ borderColor: `${color}55` }}
      >
        <p className="germany-map-tooltip-city">{city}</p>
        <p className="germany-map-tooltip-state">{state}</p>
      </div>
    </foreignObject>
  );
}

/**
 * Interactive SVG map of Germany with lat/lng markers and tooltips (fixed view).
 * @param {{ locations?: Array<{ city: string, state: string, latitude: number, longitude: number }>, className?: string, title?: string, subtitle?: string }} props
 */
export default function GermanyMap({
  locations = DEFAULT_GERMANY_LOCATIONS,
  className = "",
  subtitle = "Explore cities and states across Germany where you can start your university journey with GIDZ UniPath",
}) {
  const [activeId, setActiveId] = useState(null);
  const [geoReady, setGeoReady] = useState(false);

  const handleGeoReady = useCallback(() => {
    setGeoReady(true);
  }, []);

  const markers = useMemo(
    () =>
      (locations || []).map((loc, index) => ({
        ...loc,
        id: `${loc.city}-${loc.latitude}-${loc.longitude}`,
        coordinates: [Number(loc.longitude), Number(loc.latitude)],
        color: MARKER_COLORS[index % MARKER_COLORS.length],
      })),
    [locations]
  );

  return (
    <section
      className={`py-16 sm:py-20 relative overflow-hidden ${className}`}
      aria-label="Germany locations map"
    >
      <div className="absolute inset-0 germany-map-bg" aria-hidden="true" />
      <div
        className="absolute top-10 right-[8%] w-40 h-40 rounded-full bg-sky-400/20 blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: "0.5s" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-16 left-[6%] w-56 h-56 rounded-full bg-rose-400/15 blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-appleGray-800 mb-4 sm:mb-5 leading-tight">
            You Can Join Universities{" "}
            <span className="text-gradient">From Across Germany</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-rose-400 mx-auto mb-4 sm:mb-5" />
          <p className="text-lg sm:text-xl text-appleGray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          
        </div>

        <div className="germany-map-shell animate-scale-in">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[280px] sm:min-h-[360px]">
            {!geoReady && (
              <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl bg-white/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                  <span className="text-sm text-appleGray-600 font-medium">Loading map…</span>
                </div>
              </div>
            )}

            <ComposableMap
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              projection="geoMercator"
              projectionConfig={{
                center: MAP_CENTER,
                scale: MAP_PROJECTION_SCALE,
              }}
              className="germany-map-svg w-full h-full germany-map-svg--fixed"
            >
              <GermanyMapLayers
                markers={markers}
                activeId={activeId}
                setActiveId={setActiveId}
                onGeoReady={handleGeoReady}
              />
            </ComposableMap>
          </div>

          {markers.length > 0 && (
            <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3 px-1">
              {markers.map((marker) => (
                <li key={marker.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(marker.id)}
                    onMouseLeave={() =>
                      setActiveId((prev) => (prev === marker.id ? null : prev))
                    }
                    onFocus={() => setActiveId(marker.id)}
                    onBlur={() =>
                      setActiveId((prev) => (prev === marker.id ? null : prev))
                    }
                    onClick={() =>
                      setActiveId((prev) => (prev === marker.id ? null : marker.id))
                    }
                    className={`germany-map-legend-chip ${
                      activeId === marker.id ? "germany-map-legend-chip--active" : ""
                    }`}
                    style={{ "--chip-color": marker.color }}
                  >
                    <span className="germany-map-legend-dot" />
                    {marker.city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
