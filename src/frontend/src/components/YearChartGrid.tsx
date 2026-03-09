import { useMemo } from "react";
import { calculateDasaCycle, calculateYearNumber } from "../utils/numerology";
import { NatalChart } from "./NatalChart";

const GREEN = "#16a34a";
// Dark navy — matches DASA_COLOR in NatalChart, visible on light background
const DASA_COLOR = "#1E3A5F";

interface YearChartGridProps {
  day: number;
  month: number;
  year: number; // birth year
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  fromYear: number;
  toYear: number;
}

interface YearEntry {
  yearIter: number;
  dasaNumber: number;
  yearNumber: number;
  yearLabel: string;
}

export function YearChartGrid({
  day,
  month,
  year,
  basicNumber,
  destinyNumber,
  natalCellCounts,
  fromYear,
  toYear,
}: YearChartGridProps) {
  const entries = useMemo<YearEntry[]>(() => {
    const dasaPeriods = calculateDasaCycle(basicNumber, year, fromYear, toYear);
    const result: YearEntry[] = [];

    const clampedTo = Math.min(toYear, fromYear + 99); // max 100 cards

    for (let y = fromYear; y <= clampedTo; y++) {
      // Find which dasa period this year falls into
      const period = dasaPeriods.find((p) => y >= p.startYear && y < p.endYear);
      const dasaNumber = period ? period.dasaNumber : basicNumber;

      const yearNumber = calculateYearNumber(day, month, y);
      result.push({
        yearIter: y,
        dasaNumber,
        yearNumber,
        yearLabel: `${y} - ${y + 1}`,
      });
    }

    return result;
  }, [day, month, year, basicNumber, fromYear, toYear]);

  return (
    <div data-ocid="year_charts.panel" className="space-y-4">
      {/* Legend */}
      <div className="flex gap-5 flex-wrap items-center px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: DASA_COLOR }}
          />
          <span
            className="text-xs font-body italic"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Dasa number
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: GREEN }} />
          <span
            className="text-xs font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Year number
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-body"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Showing {entries.length} year charts
          </span>
        </div>
      </div>

      {/* Year chart grid — 2 columns */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <div
            key={entry.yearIter}
            data-ocid="year_chart.card"
            className="rounded-md overflow-hidden"
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <NatalChart
              cellCounts={natalCellCounts}
              basicNumber={basicNumber}
              destinyNumber={destinyNumber}
              animate={false}
              dasaNumber={entry.dasaNumber}
              yearNumber={entry.yearNumber}
              compact={true}
              yearLabel={entry.yearLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
