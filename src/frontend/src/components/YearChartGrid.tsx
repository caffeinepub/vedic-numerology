import { useMemo, useState } from "react";
import { calculateDasaCycle, calculateYearNumber } from "../utils/numerology";
import { MonthChartDetail } from "./MonthChartDetail";
import { NatalChart } from "./NatalChart";

const GREEN = "#16a34a";
const DASA_COLOR = "#16a34a"; // green
const YEAR_COLOR = "#ffffff"; // white

interface YearChartGridProps {
  day: number;
  month: number;
  year: number; // birth year
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  fromYear: number;
  toYear: number;
  /** If false, clicking year cards shows a paywall instead of month chart */
  canAccessMonth?: boolean;
  onMonthLocked?: () => void;
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
  canAccessMonth = true,
  onMonthLocked,
}: YearChartGridProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const entries = useMemo<YearEntry[]>(() => {
    const dasaPeriods = calculateDasaCycle(basicNumber, year, fromYear, toYear);
    const result: YearEntry[] = [];

    const clampedTo = Math.min(toYear, fromYear + 99);

    for (let y = fromYear; y <= clampedTo; y++) {
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

  const selectedEntry =
    selectedYear !== null
      ? (entries.find((e) => e.yearIter === selectedYear) ?? null)
      : null;

  function handleYearClick(yearIter: number) {
    if (!canAccessMonth) {
      onMonthLocked?.();
      return;
    }
    setSelectedYear(yearIter);
  }

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
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: YEAR_COLOR, border: "1.5px solid #aaa" }}
          />
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
            {entries.length} year charts ·{" "}
            {canAccessMonth
              ? "Tap card for months"
              : "🔒 Month charts require Paid access"}
          </span>
        </div>
      </div>

      {/* Year chart grid — 2 columns */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <button
            key={entry.yearIter}
            type="button"
            data-ocid="year_chart.card"
            className="rounded-md overflow-hidden cursor-pointer transition-all text-left w-full p-0 bg-transparent"
            onClick={() => handleYearClick(entry.yearIter)}
            style={{
              background: "oklch(var(--card))",
              border:
                selectedYear === entry.yearIter
                  ? `2px solid ${GREEN}`
                  : "1px solid oklch(var(--border))",
              boxShadow:
                selectedYear === entry.yearIter
                  ? `0 0 0 2px ${GREEN}33`
                  : "none",
              transform:
                selectedYear === entry.yearIter ? "scale(1.02)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = GREEN;
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                `0 0 0 2px ${GREEN}22`;
            }}
            onMouseLeave={(e) => {
              if (selectedYear !== entry.yearIter) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "oklch(var(--border))";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }
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
          </button>
        ))}
      </div>

      {/* Month Chart Detail Modal */}
      {selectedEntry !== null && selectedYear !== null && canAccessMonth && (
        <MonthChartDetail
          day={day}
          month={month}
          birthYear={year}
          targetYear={selectedYear}
          basicNumber={basicNumber}
          destinyNumber={destinyNumber}
          natalCellCounts={natalCellCounts}
          dasaNumber={selectedEntry.dasaNumber}
          yearNumber={selectedEntry.yearNumber}
          onClose={() => setSelectedYear(null)}
        />
      )}
    </div>
  );
}
