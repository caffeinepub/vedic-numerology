import { motion } from "motion/react";
import { GRID_LAYOUT, getCellDisplay } from "../utils/numerology";

interface NatalChartProps {
  cellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
  animate?: boolean;
  /** Current dasa number — shown in dark navy on light background */
  dasaNumber?: number;
  /** Year number — shown in green after dasa display */
  yearNumber?: number;
  /** Compact size for year grid view */
  compact?: boolean;
  /** If provided, shows a green header instead of the default "NATAL CHAR" header */
  yearLabel?: string;
  /** Month number — shown in purple after dasa/year digits */
  monthNumber?: number;
  /** Day number — shown in red */
  dayNumber?: number;
  /** Hide the chart header entirely */
  hideHeader?: boolean;
}

const GREEN = "#16a34a";
// Dark navy — clearly visible on light/creamy background
const DASA_COLOR = "#1E3A5F";
const MONTH_COLOR = "#7c3aed";
const DAY_COLOR = "#dc2626";

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
            style={{ background: GREEN, color: "#ffffff" }}
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

      {/* Grid */}
      <div
        className="grid grid-cols-3"
        style={{
          border: "2px solid oklch(var(--natal-border))",
          borderTop: hideHeader
            ? "2px solid oklch(var(--natal-border))"
            : "none",
        }}
      >
        {GRID_LAYOUT.map((row, rowIdx) =>
          row.map((num, colIdx) => {
            const display = getCellDisplay(num, cellCounts);
            const count = cellCounts[num] || 0;
            const isBasic = num === basicNumber && count > 0;
            const isDestiny = num === destinyNumber && count > 0;
            const isMultiple = count > 1;
            const hasValue = count > 0;

            const hasDasa = dasaNumber === num;
            const hasYear = yearNumber === num;
            const hasMonth = monthNumber === num;
            const hasDay = dayNumber === num;

            // Natal number color
            const natalColor = isBasic
              ? "oklch(var(--number-basic))"
              : isDestiny
                ? "oklch(var(--number-destiny))"
                : isMultiple
                  ? "oklch(var(--number-multi))"
                  : "oklch(var(--number-single))";

            // Build font size based on total display length
            const totalChars =
              (hasValue ? display.length : 0) +
              (hasDasa ? 1 : 0) +
              (hasYear ? 1 : 0) +
              (hasMonth ? 1 : 0) +
              (hasDay ? 1 : 0);
            const fontSize = compact
              ? totalChars <= 1
                ? "1.1rem"
                : totalChars === 2
                  ? "0.9rem"
                  : "0.75rem"
              : totalChars <= 1
                ? "2rem"
                : totalChars === 2
                  ? "1.6rem"
                  : "1.2rem";

            return (
              <motion.div
                key={`cell-${num}`}
                initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: shouldAnimate ? (rowIdx * 3 + colIdx) * 0.05 : 0,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="relative flex items-center justify-center"
                style={{
                  aspectRatio: "1 / 1",
                  minHeight: cellMinHeight,
                  background:
                    hasValue || hasDasa || hasYear || hasMonth || hasDay
                      ? "oklch(0.94 0.02 80)"
                      : "oklch(var(--natal-cell-bg))",
                  borderRight:
                    colIdx < 2
                      ? "1.5px solid oklch(var(--natal-border) / 0.6)"
                      : "none",
                  borderBottom:
                    rowIdx < 2
                      ? "1.5px solid oklch(var(--natal-border) / 0.6)"
                      : "none",
                  boxShadow:
                    hasValue || hasDasa || hasYear || hasMonth || hasDay
                      ? "inset 0 0 12px oklch(0.76 0.165 68 / 0.10)"
                      : "none",
                  transition: "background 0.2s ease",
                }}
              >
                {/* Watermark — always present, behind all content */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: watermarkFontSize,
                    fontFamily: "serif",
                    fontWeight: 600,
                    color: "#666",
                    opacity: 0.1,
                    transform: "rotate(-20deg)",
                    userSelect: "none",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 0,
                    letterSpacing: "0.05em",
                  }}
                >
                  Viku Kharb
                </span>

                {/* Corner label (position number) */}
                {!compact && (
                  <span
                    className="absolute top-1 left-1.5 text-[9px] font-body select-none"
                    style={{
                      color: "oklch(0.65 0.01 264)",
                      opacity: 0.5,
                      zIndex: 1,
                    }}
                  >
                    {num}
                  </span>
                )}

                {/* Cell content: natal + dasa + year + month + day */}
                {(hasValue || hasDasa || hasYear || hasMonth || hasDay) && (
                  <motion.span
                    initial={shouldAnimate ? { opacity: 0, y: 4 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldAnimate
                        ? (rowIdx * 3 + colIdx) * 0.05 + 0.15
                        : 0,
                      duration: 0.25,
                    }}
                    className="font-display font-bold select-none leading-none flex items-center"
                    style={{ fontSize, position: "relative", zIndex: 1 }}
                  >
                    {/* Natal digits */}
                    {hasValue && (
                      <span
                        style={{
                          color: natalColor,
                          textShadow: isBasic
                            ? "0 0 12px oklch(0.72 0.15 70 / 0.4)"
                            : isDestiny
                              ? "0 0 12px oklch(0.45 0.20 260 / 0.3)"
                              : "none",
                        }}
                      >
                        {display}
                      </span>
                    )}
                    {/* Dasa digit in dark navy */}
                    {hasDasa && (
                      <span style={{ color: DASA_COLOR, fontStyle: "italic" }}>
                        {num}
                      </span>
                    )}
                    {/* Year digit in green */}
                    {hasYear && <span style={{ color: GREEN }}>{num}</span>}
                    {/* Month digit in purple */}
                    {hasMonth && (
                      <span style={{ color: MONTH_COLOR }}>{num}</span>
                    )}
                    {/* Day digit in red */}
                    {hasDay && (
                      <span style={{ color: DAY_COLOR, fontWeight: 900 }}>
                        {num}
                      </span>
                    )}
                  </motion.span>
                )}
              </motion.div>
            );
          }),
        )}
      </div>

      {/* Legend (only for non-compact, non-yearLabel charts) */}
      {!compact && !yearLabel && (
        <div className="flex gap-4 justify-center mt-3 flex-wrap">
          <LegendItem color="oklch(var(--number-basic))" label="Basic" />
          <LegendItem color="oklch(var(--number-destiny))" label="Destiny" />
          <LegendItem color="oklch(var(--number-multi))" label="Repeated" />
          <LegendItem color="oklch(var(--number-single))" label="Single" />
          <LegendItem color={DASA_COLOR} label="Dasa" />
          <LegendItem color={GREEN} label="Year" />
          <LegendItem color={MONTH_COLOR} label="Month" />
          <LegendItem color={DAY_COLOR} label="Day" />
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span
        className="text-xs font-body"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {label}
      </span>
    </div>
  );
}
