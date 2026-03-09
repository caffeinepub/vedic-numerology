import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { calculateMonthCycle } from "../utils/numerology";
import { NatalChart } from "./NatalChart";

const GREEN = "#16a34a";

interface MonthChartDetailProps {
  day: number;
  month: number;
  birthYear: number;
  targetYear: number;
  basicNumber: number;
  destinyNumber: number;
  natalCellCounts: Record<number, number>;
  dasaNumber: number;
  yearNumber: number;
  onClose: () => void;
}

function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function MonthChartDetail({
  day,
  month,
  targetYear,
  basicNumber,
  destinyNumber,
  natalCellCounts,
  dasaNumber,
  yearNumber,
  onClose,
}: MonthChartDetailProps) {
  const periods = calculateMonthCycle(day, month, targetYear, yearNumber);

  // Last period ends on day 360 from birthday; remainder is days 361–365
  const lastPeriod = periods[periods.length - 1];
  const remainderStart = new Date(lastPeriod.endDate);
  remainderStart.setDate(remainderStart.getDate() + 1);
  const remainderEnd = new Date(remainderStart);
  remainderEnd.setDate(remainderEnd.getDate() + 4); // 5 days inclusive

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="month_detail.dialog"
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0"
        style={{
          background: "oklch(var(--background))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="sticky top-0 z-10 px-4 py-3 flex flex-row items-center justify-between"
          style={{
            background: GREEN,
            borderBottom: "none",
          }}
        >
          <DialogTitle className="font-display font-bold tracking-widest text-sm uppercase text-white">
            YEAR {targetYear} – {targetYear + 1}
          </DialogTitle>
          <button
            type="button"
            data-ocid="month_detail.close_button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Side-by-side: Natal + Year chart */}
          <div className="grid grid-cols-2 gap-3">
            {/* Natal chart (no dasa/year overlay) */}
            <div
              className="rounded-md overflow-hidden"
              style={{
                border: "1px solid oklch(var(--border))",
                background: "oklch(var(--card))",
              }}
            >
              <div
                className="py-1.5 px-3 text-center font-display font-bold tracking-widest text-xs uppercase text-white"
                style={{ background: "oklch(0.35 0.05 264)" }}
              >
                NATAL
              </div>
              <NatalChart
                cellCounts={natalCellCounts}
                basicNumber={basicNumber}
                destinyNumber={destinyNumber}
                animate={false}
                compact={true}
              />
            </div>

            {/* Year chart with dasa + year numbers */}
            <div
              className="rounded-md overflow-hidden"
              style={{
                border: "1px solid oklch(var(--border))",
                background: "oklch(var(--card))",
              }}
            >
              <NatalChart
                cellCounts={natalCellCounts}
                basicNumber={basicNumber}
                destinyNumber={destinyNumber}
                animate={false}
                dasaNumber={dasaNumber}
                yearNumber={yearNumber}
                compact={true}
                yearLabel={`${targetYear} - ${targetYear + 1}`}
              />
            </div>
          </div>

          {/* Month period charts legend */}
          <div className="flex gap-4 flex-wrap items-center px-1 text-xs font-body">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
              <span style={{ color: "oklch(var(--muted-foreground))" }}>
                Month number
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: GREEN }}
              />
              <span style={{ color: "oklch(var(--muted-foreground))" }}>
                Year number
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" />
              <span style={{ color: "oklch(var(--muted-foreground))" }}>
                Dasa number
              </span>
            </div>
          </div>

          {/* Month period charts grid */}
          <div className="grid grid-cols-2 gap-3">
            {periods.map((period, idx) => (
              <div
                key={`month-period-num${period.monthNumber}-pos${idx}`}
                data-ocid={`month_chart.item.${idx + 1}`}
                className="rounded-md overflow-hidden"
                style={{
                  border: "1px solid oklch(var(--border))",
                  background: "oklch(var(--card))",
                }}
              >
                {/* Date range header */}
                <div
                  className="py-1 px-2 text-center font-body text-[10px] font-semibold text-white"
                  style={{ background: GREEN }}
                >
                  {formatDate(period.startDate)} – {formatDate(period.endDate)}
                </div>
                <NatalChart
                  cellCounts={natalCellCounts}
                  basicNumber={basicNumber}
                  destinyNumber={destinyNumber}
                  animate={false}
                  dasaNumber={dasaNumber}
                  yearNumber={yearNumber}
                  monthNumber={period.monthNumber}
                  compact={true}
                />
              </div>
            ))}

            {/* Remainder card — last 5 days, no chart, just a line */}
            <div
              data-ocid="month_chart.remainder.card"
              className="rounded-md overflow-hidden"
              style={{
                border: "1px solid oklch(var(--border))",
                background: "oklch(var(--card))",
              }}
            >
              {/* Date range header */}
              <div
                className="py-1 px-2 text-center font-body text-[10px] font-semibold text-white"
                style={{ background: "oklch(0.55 0.04 264)" }}
              >
                {formatDate(remainderStart)} – {formatDate(remainderEnd)}
              </div>
              {/* Blank remainder — just a divider line */}
              <div
                className="flex items-center justify-center"
                style={{
                  minHeight: "44px",
                  aspectRatio: "unset",
                  padding: "12px",
                }}
              >
                <div
                  className="w-full"
                  style={{
                    height: "2px",
                    background: "oklch(var(--border))",
                    borderRadius: "1px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
