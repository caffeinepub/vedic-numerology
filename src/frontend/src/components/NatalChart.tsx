import { motion } from "motion/react";
import { GRID_LAYOUT, getCellDisplay } from "../utils/numerology";

interface NatalChartProps {
  cellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
  animate?: boolean;
  /** Current dasa number */
  dasaNumber?: number;
  /** Year number */
  yearNumber?: number;
  /** Compact size for year grid view */
  compact?: boolean;
  /** If provided, shows a green header instead of the default "NATAL CHAR" header */
  yearLabel?: string;
  /** Month number */
  monthNumber?: number;
  /** Day number */
  dayNumber?: number;
  /** Hide the chart header entirely */
  hideHeader?: boolean;
}

const GREEN_HEADER = "#16a34a";
const MONTH_COLOR = "#7c3aed";
const DAY_COLOR = "#dc2626";

// Updated color scheme
const BASIC_COLOR = "#dc2626"; // red
const DESTINY_COLOR = "#eab308"; // yellow
const NATAL_COLOR = "#000000"; // black for other natal numbers
const DASA_COLOR = "#16a34a"; // green
const YEAR_COLOR = "#ffffff"; // white

export function NatalChart({
  cellCounts,
  basicNumber,
  destinyNumber,
  animate: shouldAnimate = true,
  dasaNumber,
  yearNumber,
  compact = false,
  yearLabel,
  monthNumber,
  dayNumber,
  hideHeader = false,
}: NatalChartProps) {
  const cellMinHeight = compact ? "44px" : "72px";
  const watermarkFontSize = compact ? "8px" : "10px";

  return (
    <div
      data-ocid="natal_chart.panel"
      className="w-full"
      style={{
        maxWidth: compact ? "100%" : "320px",
        margin: compact ? 0 : "0 auto",
      }}
    >
      {/* Header */}
      {!hideHeader &&
        (yearLabel ? (
          <div
            className="py-1.5 px-3 text-center font-display font-bold tracking-[0.12em] text-xs uppercase"
            style={{ background: GREEN_HEADER, color: "#ffffff" }}
          >
            {yearLabel}
          </div>
        ) : (
          <div
            className="py-2.5 px-4 text-center font-display font-bold tracking-[0.2em] text-sm uppercase"
            style={{
              background: "oklch(var(--natal-header))",
              color: "oklch(var(--natal-header-fg))",
            }}
          >
            NATAL CHAR
          </div>
        ))}

      {/* 3×3 Grid */}
      <div
        className="grid grid-cols-3"
        style={{
          border: "1.5px solid oklch(var(--natal-border))",
          borderTop: hideHeader || !yearLabel ? undefined : "none",
        }}
      >
        {GRID_LAYOUT.flat().map((cellNum, idx) => {
          const count = cellCounts[cellNum] ?? 0;
          const display = getCellDisplay(cellNum, cellCounts);

          // Determine which special numbers fall here
          const isBasic = cellNum === basicNumber;
          const isDestiny = cellNum === destinyNumber;
          const isDasa = dasaNumber !== undefined && cellNum === dasaNumber;
          const isYear = yearNumber !== undefined && cellNum === yearNumber;
          const isMonth = monthNumber !== undefined && cellNum === monthNumber;
          const isDay = dayNumber !== undefined && cellNum === dayNumber;

          const row = Math.floor(idx / 3);
          const col = idx % 3;

          return (
            <div
              key={cellNum}
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                minHeight: cellMinHeight,
                background: "oklch(var(--natal-cell-bg))",
                borderRight:
                  col < 2 ? "1px solid oklch(var(--natal-border))" : "none",
                borderBottom:
                  row < 2 ? "1px solid oklch(var(--natal-border))" : "none",
              }}
            >
              {/* Watermark */}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{
                  fontSize: watermarkFontSize,
                  color: "oklch(0.75 0.04 90 / 0.35)",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 400,
                  transform: "rotate(-20deg)",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  letterSpacing: "0.05em",
                }}
              >
                Viku Kharb
              </span>

              {/* Numbers container */}
              <div
                className="relative z-10 flex flex-col items-center justify-center gap-0.5"
                style={{ padding: compact ? "2px" : "4px" }}
              >
                {/* Natal numbers */}
                {count > 0 && (
                  <motion.span
                    initial={shouldAnimate ? { scale: 0.5, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: shouldAnimate ? idx * 0.05 : 0,
                      type: "spring",
                      stiffness: 300,
                    }}
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: compact ? "14px" : "22px",
                      color: isBasic
                        ? BASIC_COLOR
                        : isDestiny
                          ? DESTINY_COLOR
                          : NATAL_COLOR,
                    }}
                  >
                    {display}
                  </motion.span>
                )}

                {/* Dasa number (green, slightly larger) */}
                {isDasa && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: compact ? "11px" : "17px",
                      color: DASA_COLOR,
                    }}
                  >
                    {dasaNumber}
                  </span>
                )}

                {/* Year number (white, largest) */}
                {isYear && (
                  <span
                    className="font-display font-bold leading-none rounded-sm px-0.5"
                    style={{
                      fontSize: compact ? "13px" : "19px",
                      color: YEAR_COLOR,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  >
                    {yearNumber}
                  </span>
                )}

                {/* Month number (purple) */}
                {isMonth && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: compact ? "10px" : "14px",
                      color: MONTH_COLOR,
                    }}
                  >
                    {monthNumber}
                  </span>
                )}

                {/* Day number (red, only in day chart) */}
                {isDay && (
                  <span
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: compact ? "11px" : "15px",
                      color: DAY_COLOR,
                      fontStyle: "italic",
                    }}
                  >
                    {dayNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
