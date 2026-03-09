import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface YearScrollPickerProps {
  value: string;
  onChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
}

const ITEM_HEIGHT = 36; // px per year item
const VISIBLE_COUNT = 5; // how many years visible in the panel

export function YearScrollPicker({
  value,
  onChange,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
}: YearScrollPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );

  const selectedYear = value ? Number.parseInt(value, 10) : null;

  // Scroll to selected year when panel opens
  useEffect(() => {
    if (open && listRef.current && selectedYear) {
      const idx = years.indexOf(selectedYear);
      if (idx >= 0) {
        const scrollTop =
          idx * ITEM_HEIGHT - ((VISIBLE_COUNT - 1) * ITEM_HEIGHT) / 2;
        listRef.current.scrollTop = Math.max(0, scrollTop);
      }
    }
  }, [open, selectedYear, years]);

  // Close panel on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function scrollBy(delta: number) {
    if (!selectedYear) {
      // If no year selected, start from current year
      const start = maxYear;
      onChange(
        String(
          start + delta < minYear
            ? minYear
            : start + delta > maxYear
              ? maxYear
              : start + delta,
        ),
      );
      return;
    }
    const next = selectedYear - delta; // delta>0 scrolls up = earlier year (higher in list)
    if (next >= minYear && next <= maxYear) {
      onChange(String(next));
    }
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    scrollBy(direction);
  }

  return (
    <div ref={containerRef} className="relative select-none">
      {/* Trigger button */}
      <button
        type="button"
        data-ocid="dob.year.input"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-9 px-3 flex items-center justify-between rounded-md text-sm font-body transition-colors"
        style={{
          background: "oklch(var(--input))",
          border: "1px solid oklch(var(--border))",
          color: selectedYear
            ? "oklch(var(--foreground))"
            : "oklch(var(--muted-foreground))",
        }}
      >
        <span>{selectedYear || "YYYY"}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 opacity-50 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md shadow-lg overflow-hidden"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          {/* Up arrow button */}
          <button
            type="button"
            data-ocid="dob.year.scroll_up.button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollBy(-1)}
            disabled={selectedYear === maxYear}
            className="w-full flex items-center justify-center py-1.5 transition-colors"
            style={{
              color: "oklch(var(--muted-foreground))",
              borderBottom: "1px solid oklch(var(--border))",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(var(--secondary))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Scrollable year list */}
          <div
            ref={listRef}
            onWheel={handleWheel}
            className="overflow-y-auto"
            style={{
              maxHeight: `${ITEM_HEIGHT * VISIBLE_COUNT}px`,
              scrollBehavior: "smooth",
            }}
          >
            {years.map((y) => {
              const isSelected = y === selectedYear;
              return (
                <button
                  key={y}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(String(y));
                    setOpen(false);
                  }}
                  className="w-full text-center text-sm font-body py-2 px-3 transition-colors"
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    fontWeight: isSelected ? "700" : "400",
                    background: isSelected
                      ? "oklch(var(--primary) / 0.12)"
                      : "transparent",
                    color: isSelected
                      ? "oklch(var(--primary))"
                      : "oklch(var(--foreground))",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(var(--secondary))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>

          {/* Down arrow button */}
          <button
            type="button"
            data-ocid="dob.year.scroll_down.button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollBy(1)}
            disabled={selectedYear === minYear}
            className="w-full flex items-center justify-center py-1.5 transition-colors"
            style={{
              color: "oklch(var(--muted-foreground))",
              borderTop: "1px solid oklch(var(--border))",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(var(--secondary))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
