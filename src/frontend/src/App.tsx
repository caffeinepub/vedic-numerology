import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Loader2,
  Stars,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { NatalChart } from "./components/NatalChart";
import { YearChartGrid } from "./components/YearChartGrid";
import { YearScrollPicker } from "./components/YearScrollPicker";
import {
  type Chart,
  useCreateChart,
  useDeleteChart,
  useGetAllCharts,
} from "./hooks/useQueries";
import {
  type NumerologyResult,
  calculateNumerology,
  formatDOB,
  getMonthName,
  validateDOB,
} from "./utils/numerology";

// ─── DOB State ─────────────────────────────────────────────────────────────────

interface DOBState {
  day: string;
  month: string;
  year: string;
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [dob, setDob] = useState<DOBState>({ day: "", month: "", year: "" });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [selectedSaved, setSelectedSaved] = useState<Chart | null>(null);
  const [activeTab, setActiveTab] = useState("new");

  // Year range for dasa/year charts
  const [fromYear, setFromYear] = useState<number>(new Date().getFullYear());
  const [toYear, setToYear] = useState<number>(new Date().getFullYear() + 44);
  const [showYearCharts, setShowYearCharts] = useState(false);

  // ── Comparison state ─────────────────────────────────────────────────────────
  const [p1Dob, setP1Dob] = useState<DOBState>({
    day: "",
    month: "",
    year: "",
  });
  const [p2Dob, setP2Dob] = useState<DOBState>({
    day: "",
    month: "",
    year: "",
  });
  const [compFromYear, setCompFromYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [compToYear, setCompToYear] = useState<number>(
    new Date().getFullYear() + 44,
  );
  const [showComparison, setShowComparison] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [p1Result, setP1Result] = useState<NumerologyResult | null>(null);
  const [p2Result, setP2Result] = useState<NumerologyResult | null>(null);

  const { data: charts = [], isLoading: chartsLoading } = useGetAllCharts();
  const createChart = useCreateChart();
  const deleteChart = useDeleteChart();

  // ── DOB Calculation ──────────────────────────────────────────────────────────

  function handleShowChart() {
    const day = Number.parseInt(dob.day, 10);
    const month = Number.parseInt(dob.month, 10);
    const year = Number.parseInt(dob.year, 10);

    if (!dob.day || !dob.month || !dob.year) {
      setDobError("Please select a complete date of birth.");
      return;
    }

    const validationError = validateDOB(day, month, year);
    if (validationError) {
      setDobError(validationError);
      return;
    }

    setDobError(null);
    const dobStr = formatDOB(day, month, year);
    const calc = calculateNumerology(dobStr);
    setResult(calc);
    // Reset year charts and set default range from birth year
    setShowYearCharts(false);
    setFromYear(year);
    setToYear(year + 44);
  }

  // ── Comparison Show Chart ────────────────────────────────────────────────────

  function handleShowComparison() {
    if (!p1Dob.day || !p1Dob.month || !p1Dob.year) {
      setCompError("Please enter a complete date of birth for Person 1.");
      return;
    }
    if (!p2Dob.day || !p2Dob.month || !p2Dob.year) {
      setCompError("Please enter a complete date of birth for Person 2.");
      return;
    }

    const d1 = Number.parseInt(p1Dob.day, 10);
    const m1 = Number.parseInt(p1Dob.month, 10);
    const y1 = Number.parseInt(p1Dob.year, 10);
    const err1 = validateDOB(d1, m1, y1);
    if (err1) {
      setCompError(`Person 1: ${err1}`);
      return;
    }

    const d2 = Number.parseInt(p2Dob.day, 10);
    const m2 = Number.parseInt(p2Dob.month, 10);
    const y2 = Number.parseInt(p2Dob.year, 10);
    const err2 = validateDOB(d2, m2, y2);
    if (err2) {
      setCompError(`Person 2: ${err2}`);
      return;
    }

    setCompError(null);
    setP1Result(calculateNumerology(formatDOB(d1, m1, y1)));
    setP2Result(calculateNumerology(formatDOB(d2, m2, y2)));
    setShowComparison(true);
  }

  // ── Save Chart ───────────────────────────────────────────────────────────────

  async function handleSaveConfirm() {
    if (!result || !saveName.trim()) return;

    const dobStr = formatDOB(
      Number.parseInt(dob.day, 10),
      Number.parseInt(dob.month, 10),
      Number.parseInt(dob.year, 10),
    );

    try {
      await createChart.mutateAsync({
        name: saveName.trim(),
        dob: dobStr,
        basicNumber: result.basicNumber,
        destinyNumber: result.destinyNumber,
        chartNumbers: result.chartNumbers,
      });
      setSaveDialogOpen(false);
      setSaveName("");
      toast.success("Chart saved successfully!");
    } catch {
      toast.error("Failed to save chart. Please try again.");
    }
  }

  // ── Delete Chart ─────────────────────────────────────────────────────────────

  async function handleDeleteChart(e: React.MouseEvent, id: bigint) {
    e.stopPropagation();
    try {
      await deleteChart.mutateAsync(id);
      if (selectedSaved?.id === id) {
        setSelectedSaved(null);
      }
      toast.success("Chart deleted.");
    } catch {
      toast.error("Failed to delete chart.");
    }
  }

  // ── Reconstruct result from saved chart ─────────────────────────────────────

  function getSavedResult(chart: Chart): NumerologyResult {
    const chartNumbers = chart.chartNumbers.map(Number);
    const cellCounts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) cellCounts[i] = 0;
    for (const n of chartNumbers) {
      if (n >= 1 && n <= 9) cellCounts[n] = (cellCounts[n] || 0) + 1;
    }
    return {
      basicNumber: Number(chart.basicNumber),
      destinyNumber: Number(chart.destinyNumber),
      chartNumbers,
      cellCounts,
    };
  }

  // ─── Day Options ─────────────────────────────────────────────────────────────

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  // yearOptions moved to YearScrollPicker component

  return (
    <div className="relative min-h-screen flex flex-col z-10">
      <Toaster position="top-right" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="relative pt-8 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Stars
            className="w-6 h-6"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-wide"
            style={{ color: "oklch(var(--primary))" }}
          >
            Vedic Numerology
          </h1>
          <Stars
            className="w-6 h-6"
            style={{ color: "oklch(var(--primary))" }}
          />
        </div>
        <p
          className="font-body text-sm tracking-widest uppercase"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          Ancient Numbers · Modern Insight
        </p>
        <p
          className="font-body text-xs mt-1 tracking-wide"
          style={{ color: "oklch(var(--muted-foreground) / 0.7)" }}
        >
          By Viku Kharb
        </p>
        {/* Decorative divider */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div
            className="h-px w-24"
            style={{ background: "oklch(var(--primary) / 0.3)" }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ background: "oklch(var(--primary))" }}
          />
          <div
            className="h-px w-24"
            style={{ background: "oklch(var(--primary) / 0.3)" }}
          />
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 pb-16 max-w-lg mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="w-full mb-6"
            style={{
              background: "oklch(var(--secondary))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <TabsTrigger
              value="new"
              data-ocid="new_tab.tab"
              className="flex-1 font-body data-[state=active]:font-semibold"
            >
              New Chart
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              data-ocid="saved_tab.tab"
              className="flex-1 font-body data-[state=active]:font-semibold"
            >
              Saved ({charts.length})
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              data-ocid="comparison_tab.tab"
              className="flex-1 font-body data-[state=active]:font-semibold"
            >
              Compare
            </TabsTrigger>
          </TabsList>

          {/* ── New Chart Tab ────────────────────────────────────────────── */}
          <TabsContent value="new" className="space-y-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* DOB Input Card */}
              <div
                className="rounded-lg p-5"
                style={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              >
                <h2
                  className="font-display text-lg font-semibold mb-4"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Enter Date of Birth
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Day */}
                  <div className="space-y-1.5">
                    <Label
                      className="text-xs uppercase tracking-wider font-body"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      Day
                    </Label>
                    <select
                      data-ocid="dob.input"
                      value={dob.day}
                      onChange={(e) =>
                        setDob((prev) => ({ ...prev, day: e.target.value }))
                      }
                      className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                      style={{
                        background: "oklch(var(--input))",
                        border: "1px solid oklch(var(--border))",
                        color: dob.day
                          ? "oklch(var(--foreground))"
                          : "oklch(var(--muted-foreground))",
                      }}
                    >
                      <option value="" disabled>
                        DD
                      </option>
                      {dayOptions.map((d) => (
                        <option key={d} value={String(d)}>
                          {String(d).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div className="space-y-1.5">
                    <Label
                      className="text-xs uppercase tracking-wider font-body"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      Month
                    </Label>
                    <select
                      value={dob.month}
                      onChange={(e) =>
                        setDob((prev) => ({ ...prev, month: e.target.value }))
                      }
                      className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                      style={{
                        background: "oklch(var(--input))",
                        border: "1px solid oklch(var(--border))",
                        color: dob.month
                          ? "oklch(var(--foreground))"
                          : "oklch(var(--muted-foreground))",
                      }}
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {monthOptions.map((m) => (
                        <option key={m} value={String(m)}>
                          {String(m).padStart(2, "0")} – {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year – custom scroll picker */}
                  <div className="space-y-1.5">
                    <Label
                      className="text-xs uppercase tracking-wider font-body"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      Year
                    </Label>
                    <YearScrollPicker
                      value={dob.year}
                      onChange={(v) => setDob((prev) => ({ ...prev, year: v }))}
                    />
                  </div>
                </div>

                {/* Validation error */}
                {dobError && (
                  <p
                    className="text-xs font-body mb-3"
                    style={{ color: "oklch(var(--destructive))" }}
                  >
                    {dobError}
                  </p>
                )}

                <Button
                  onClick={handleShowChart}
                  data-ocid="show_chart.primary_button"
                  className="w-full font-body font-semibold tracking-wide"
                  style={{
                    background: "oklch(var(--primary))",
                    color: "oklch(var(--primary-foreground))",
                  }}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Natal Chart
                </Button>
              </div>

              {/* Chart Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    key="chart-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-6 space-y-5"
                  >
                    {/* Summary row */}
                    <div
                      className="rounded-lg p-4 flex items-center justify-center gap-8"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <SummaryPill
                        label="Basic"
                        value={result.basicNumber}
                        color="oklch(var(--number-basic))"
                      />
                      <div
                        className="w-px h-8"
                        style={{ background: "oklch(var(--border))" }}
                      />
                      <SummaryPill
                        label="Destiny"
                        value={result.destinyNumber}
                        color="oklch(var(--number-destiny))"
                      />
                    </div>

                    {/* Natal Chart Grid */}
                    <div
                      className="rounded-lg p-5"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        boxShadow:
                          "0 0 0 1px oklch(0.62 0.14 68 / 0.4), 0 4px 24px oklch(0.76 0.165 68 / 0.12)",
                      }}
                    >
                      <NatalChart
                        cellCounts={result.cellCounts}
                        basicNumber={result.basicNumber}
                        destinyNumber={result.destinyNumber}
                        animate={true}
                      />
                    </div>

                    {/* Dasa / Year Charts Section */}
                    <div
                      className="rounded-lg p-4 space-y-4"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <h3
                        className="font-display text-base font-semibold"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Dasa &amp; Year Charts
                      </h3>

                      {/* Year range inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            From Year
                          </Label>
                          <Input
                            data-ocid="year_range.input"
                            type="number"
                            min={1900}
                            max={2200}
                            value={fromYear}
                            onChange={(e) =>
                              setFromYear(
                                Number.parseInt(e.target.value, 10) || fromYear,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            To Year
                          </Label>
                          <Input
                            data-ocid="year_range.input"
                            type="number"
                            min={1900}
                            max={2200}
                            value={toYear}
                            onChange={(e) =>
                              setToYear(
                                Number.parseInt(e.target.value, 10) || toYear,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowYearCharts((v) => !v)}
                        data-ocid="show_year_charts.primary_button"
                        className="w-full font-body font-semibold tracking-wide"
                        style={{
                          background: "oklch(var(--primary))",
                          color: "oklch(var(--primary-foreground))",
                        }}
                      >
                        {showYearCharts
                          ? "Hide Year Charts"
                          : "Show Year Charts"}
                      </Button>
                    </div>

                    {/* Year Charts Grid */}
                    <AnimatePresence>
                      {showYearCharts && (
                        <motion.div
                          key="year-charts"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35 }}
                        >
                          <YearChartGrid
                            day={Number.parseInt(dob.day, 10)}
                            month={Number.parseInt(dob.month, 10)}
                            year={Number.parseInt(dob.year, 10)}
                            basicNumber={result.basicNumber}
                            destinyNumber={result.destinyNumber}
                            natalCellCounts={result.cellCounts}
                            fromYear={fromYear}
                            toYear={toYear}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Save button */}
                    <Button
                      onClick={() => setSaveDialogOpen(true)}
                      data-ocid="save_chart.primary_button"
                      variant="outline"
                      className="w-full font-body font-semibold tracking-wide"
                      style={{
                        borderColor: "oklch(var(--primary) / 0.5)",
                        color: "oklch(var(--primary))",
                      }}
                    >
                      Save This Chart
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* ── Saved Charts Tab ─────────────────────────────────────────── */}
          <TabsContent value="saved" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {chartsLoading ? (
                <div data-ocid="charts.loading_state" className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-20 w-full rounded-lg"
                      style={{ background: "oklch(var(--muted))" }}
                    />
                  ))}
                </div>
              ) : charts.length === 0 ? (
                <div
                  data-ocid="charts.empty_state"
                  className="text-center py-16 space-y-3"
                >
                  <BookOpen
                    className="w-12 h-12 mx-auto opacity-25"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  <p
                    className="font-display text-lg"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    No saved charts yet
                  </p>
                  <p
                    className="font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Calculate a natal chart and save it to see it here.
                  </p>
                </div>
              ) : (
                <div data-ocid="saved_charts.list" className="space-y-3">
                  {charts.map((chart, idx) => (
                    <motion.div
                      key={String(chart.id)}
                      data-ocid={`saved_chart.item.${idx + 1}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() =>
                        setSelectedSaved(
                          selectedSaved?.id === chart.id ? null : chart,
                        )
                      }
                      className="rounded-lg p-4 cursor-pointer transition-all"
                      style={{
                        background:
                          selectedSaved?.id === chart.id
                            ? "oklch(0.92 0.03 90)"
                            : "oklch(var(--card))",
                        border:
                          selectedSaved?.id === chart.id
                            ? "1px solid oklch(var(--primary) / 0.6)"
                            : "1px solid oklch(var(--border))",
                        boxShadow:
                          selectedSaved?.id === chart.id
                            ? "0 0 0 1px oklch(var(--primary) / 0.2)"
                            : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-display font-semibold text-base truncate"
                            style={{ color: "oklch(var(--foreground))" }}
                          >
                            {chart.name}
                          </p>
                          <p
                            className="font-body text-sm mt-0.5"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            {chart.dob}
                          </p>
                          <div className="flex gap-3 mt-1.5">
                            <span
                              className="font-body text-xs"
                              style={{ color: "oklch(var(--number-basic))" }}
                            >
                              Basic: {String(chart.basicNumber)}
                            </span>
                            <span
                              className="font-body text-xs"
                              style={{ color: "oklch(var(--number-destiny))" }}
                            >
                              Destiny: {String(chart.destinyNumber)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-ocid={`delete_chart.delete_button.${idx + 1}`}
                          onClick={(e) => handleDeleteChart(e, chart.id)}
                          className="p-2 rounded-md transition-colors shrink-0"
                          style={{ color: "oklch(var(--muted-foreground))" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "oklch(var(--destructive))";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background =
                              "oklch(var(--destructive) / 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "oklch(var(--muted-foreground))";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "transparent";
                          }}
                          disabled={deleteChart.isPending}
                          aria-label="Delete chart"
                        >
                          {deleteChart.isPending &&
                          deleteChart.variables === chart.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expanded chart view */}
                      <AnimatePresence>
                        {selectedSaved?.id === chart.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-4 pt-4"
                              style={{
                                borderTop: "1px solid oklch(var(--border))",
                              }}
                            >
                              <NatalChart
                                cellCounts={getSavedResult(chart).cellCounts}
                                basicNumber={Number(chart.basicNumber)}
                                destinyNumber={Number(chart.destinyNumber)}
                                animate={false}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Comparison Tab ───────────────────────────────────────────── */}
          <TabsContent value="comparison" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {!showComparison ? (
                  <motion.div
                    key="comparison-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Person 1 */}
                    <div
                      className="rounded-lg p-5"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <h2
                        className="font-display text-lg font-semibold mb-4"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Person 1
                      </h2>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Day
                          </Label>
                          <select
                            data-ocid="comparison_p1_dob.input"
                            value={p1Dob.day}
                            onChange={(e) =>
                              setP1Dob((prev) => ({
                                ...prev,
                                day: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: p1Dob.day
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              DD
                            </option>
                            {dayOptions.map((d) => (
                              <option key={d} value={String(d)}>
                                {String(d).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Month
                          </Label>
                          <select
                            value={p1Dob.month}
                            onChange={(e) =>
                              setP1Dob((prev) => ({
                                ...prev,
                                month: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: p1Dob.month
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              MM
                            </option>
                            {monthOptions.map((m) => (
                              <option key={m} value={String(m)}>
                                {String(m).padStart(2, "0")} – {getMonthName(m)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Year
                          </Label>
                          <YearScrollPicker
                            value={p1Dob.year}
                            onChange={(v) =>
                              setP1Dob((prev) => ({ ...prev, year: v }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Person 2 */}
                    <div
                      className="rounded-lg p-5"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <h2
                        className="font-display text-lg font-semibold mb-4"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Person 2
                      </h2>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Day
                          </Label>
                          <select
                            data-ocid="comparison_p2_dob.input"
                            value={p2Dob.day}
                            onChange={(e) =>
                              setP2Dob((prev) => ({
                                ...prev,
                                day: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: p2Dob.day
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              DD
                            </option>
                            {dayOptions.map((d) => (
                              <option key={d} value={String(d)}>
                                {String(d).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Month
                          </Label>
                          <select
                            value={p2Dob.month}
                            onChange={(e) =>
                              setP2Dob((prev) => ({
                                ...prev,
                                month: e.target.value,
                              }))
                            }
                            className="w-full h-9 px-3 rounded-md text-sm font-body appearance-none cursor-pointer"
                            style={{
                              background: "oklch(var(--input))",
                              border: "1px solid oklch(var(--border))",
                              color: p2Dob.month
                                ? "oklch(var(--foreground))"
                                : "oklch(var(--muted-foreground))",
                            }}
                          >
                            <option value="" disabled>
                              MM
                            </option>
                            {monthOptions.map((m) => (
                              <option key={m} value={String(m)}>
                                {String(m).padStart(2, "0")} – {getMonthName(m)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            Year
                          </Label>
                          <YearScrollPicker
                            value={p2Dob.year}
                            onChange={(v) =>
                              setP2Dob((prev) => ({ ...prev, year: v }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shared Year Range */}
                    <div
                      className="rounded-lg p-5"
                      style={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <h3
                        className="font-display text-base font-semibold mb-3"
                        style={{ color: "oklch(var(--primary))" }}
                      >
                        Year Range
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            From Year
                          </Label>
                          <Input
                            type="number"
                            min={1900}
                            max={2200}
                            value={compFromYear}
                            onChange={(e) =>
                              setCompFromYear(
                                Number.parseInt(e.target.value, 10) ||
                                  compFromYear,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-xs uppercase tracking-wider font-body"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            To Year
                          </Label>
                          <Input
                            type="number"
                            min={1900}
                            max={2200}
                            value={compToYear}
                            onChange={(e) =>
                              setCompToYear(
                                Number.parseInt(e.target.value, 10) ||
                                  compToYear,
                              )
                            }
                            className="font-body"
                            style={{
                              background: "oklch(var(--input))",
                              borderColor: "oklch(var(--border))",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {compError && (
                      <p
                        className="text-xs font-body"
                        style={{ color: "oklch(var(--destructive))" }}
                        data-ocid="comparison.error_state"
                      >
                        {compError}
                      </p>
                    )}

                    <Button
                      onClick={handleShowComparison}
                      data-ocid="comparison.primary_button"
                      className="w-full font-body font-semibold tracking-wide"
                      style={{
                        background: "oklch(var(--primary))",
                        color: "oklch(var(--primary-foreground))",
                      }}
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Compare Charts
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="comparison-results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Go Back button */}
                    <Button
                      variant="outline"
                      data-ocid="comparison.secondary_button"
                      onClick={() => setShowComparison(false)}
                      className="font-body font-semibold"
                      style={{
                        borderColor: "oklch(var(--border))",
                        color: "oklch(var(--foreground))",
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go Back
                    </Button>

                    {/* Side-by-side Natal Charts */}
                    {p1Result && p2Result && (
                      <>
                        <div
                          className="rounded-lg p-4"
                          style={{
                            background: "oklch(var(--card))",
                            border: "1px solid oklch(var(--border))",
                          }}
                        >
                          <h3
                            className="font-display text-base font-semibold mb-4 text-center"
                            style={{ color: "oklch(var(--primary))" }}
                          >
                            Natal Charts
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Person 1 natal */}
                            <div className="space-y-3">
                              <p
                                className="font-display text-sm font-semibold text-center"
                                style={{ color: "oklch(var(--primary))" }}
                              >
                                Person 1
                              </p>
                              <div className="flex justify-center gap-4 text-center">
                                <div>
                                  <p
                                    className="font-body text-xs uppercase tracking-wider"
                                    style={{
                                      color: "oklch(var(--muted-foreground))",
                                    }}
                                  >
                                    Basic
                                  </p>
                                  <p
                                    className="font-display text-2xl font-bold"
                                    style={{
                                      color: "oklch(var(--number-basic))",
                                    }}
                                  >
                                    {p1Result.basicNumber}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    className="font-body text-xs uppercase tracking-wider"
                                    style={{
                                      color: "oklch(var(--muted-foreground))",
                                    }}
                                  >
                                    Destiny
                                  </p>
                                  <p
                                    className="font-display text-2xl font-bold"
                                    style={{
                                      color: "oklch(var(--number-destiny))",
                                    }}
                                  >
                                    {p1Result.destinyNumber}
                                  </p>
                                </div>
                              </div>
                              <NatalChart
                                cellCounts={p1Result.cellCounts}
                                basicNumber={p1Result.basicNumber}
                                destinyNumber={p1Result.destinyNumber}
                                animate={true}
                              />
                            </div>

                            {/* Person 2 natal */}
                            <div className="space-y-3">
                              <p
                                className="font-display text-sm font-semibold text-center"
                                style={{ color: "oklch(var(--primary))" }}
                              >
                                Person 2
                              </p>
                              <div className="flex justify-center gap-4 text-center">
                                <div>
                                  <p
                                    className="font-body text-xs uppercase tracking-wider"
                                    style={{
                                      color: "oklch(var(--muted-foreground))",
                                    }}
                                  >
                                    Basic
                                  </p>
                                  <p
                                    className="font-display text-2xl font-bold"
                                    style={{
                                      color: "oklch(var(--number-basic))",
                                    }}
                                  >
                                    {p2Result.basicNumber}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    className="font-body text-xs uppercase tracking-wider"
                                    style={{
                                      color: "oklch(var(--muted-foreground))",
                                    }}
                                  >
                                    Destiny
                                  </p>
                                  <p
                                    className="font-display text-2xl font-bold"
                                    style={{
                                      color: "oklch(var(--number-destiny))",
                                    }}
                                  >
                                    {p2Result.destinyNumber}
                                  </p>
                                </div>
                              </div>
                              <NatalChart
                                cellCounts={p2Result.cellCounts}
                                basicNumber={p2Result.basicNumber}
                                destinyNumber={p2Result.destinyNumber}
                                animate={true}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Year/Dasa Charts side by side */}
                        <div className="space-y-4">
                          <h3
                            className="font-display text-base font-semibold text-center"
                            style={{ color: "oklch(var(--primary))" }}
                          >
                            Dasa &amp; Year Charts
                          </h3>

                          {/* Person 1 year charts */}
                          <div
                            className="rounded-lg p-4"
                            style={{
                              background: "oklch(var(--card))",
                              border: "1px solid oklch(var(--border))",
                            }}
                          >
                            <p
                              className="font-display text-sm font-semibold mb-3"
                              style={{ color: "oklch(var(--primary))" }}
                            >
                              Person 1 —{" "}
                              {formatDOB(
                                Number.parseInt(p1Dob.day, 10),
                                Number.parseInt(p1Dob.month, 10),
                                Number.parseInt(p1Dob.year, 10),
                              )}
                            </p>
                            <YearChartGrid
                              day={Number.parseInt(p1Dob.day, 10)}
                              month={Number.parseInt(p1Dob.month, 10)}
                              year={Number.parseInt(p1Dob.year, 10)}
                              basicNumber={p1Result.basicNumber}
                              destinyNumber={p1Result.destinyNumber}
                              natalCellCounts={p1Result.cellCounts}
                              fromYear={compFromYear}
                              toYear={compToYear}
                            />
                          </div>

                          {/* Person 2 year charts */}
                          <div
                            className="rounded-lg p-4"
                            style={{
                              background: "oklch(var(--card))",
                              border: "1px solid oklch(var(--border))",
                            }}
                          >
                            <p
                              className="font-display text-sm font-semibold mb-3"
                              style={{ color: "oklch(var(--primary))" }}
                            >
                              Person 2 —{" "}
                              {formatDOB(
                                Number.parseInt(p2Dob.day, 10),
                                Number.parseInt(p2Dob.month, 10),
                                Number.parseInt(p2Dob.year, 10),
                              )}
                            </p>
                            <YearChartGrid
                              day={Number.parseInt(p2Dob.day, 10)}
                              month={Number.parseInt(p2Dob.month, 10)}
                              year={Number.parseInt(p2Dob.year, 10)}
                              basicNumber={p2Result.basicNumber}
                              destinyNumber={p2Result.destinyNumber}
                              natalCellCounts={p2Result.cellCounts}
                              fromYear={compFromYear}
                              toYear={compToYear}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-6 text-center">
        <p
          className="font-body text-xs"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-opacity hover:opacity-80"
            style={{ color: "oklch(var(--primary))" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* ── Save Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent
          data-ocid="save_dialog.dialog"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display">Save Natal Chart</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Label className="font-body text-sm" htmlFor="chart-name">
              Chart Name
            </Label>
            <Input
              id="chart-name"
              data-ocid="save_name.input"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Aditya Kumar, My Chart..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveConfirm();
              }}
              autoFocus
              className="font-body"
              style={{
                background: "oklch(var(--input))",
                borderColor: "oklch(var(--border))",
              }}
            />
            {result && (
              <p
                className="text-xs font-body"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                DOB:{" "}
                {formatDOB(
                  Number.parseInt(dob.day, 10),
                  Number.parseInt(dob.month, 10),
                  Number.parseInt(dob.year, 10),
                )}{" "}
                · Basic: {result.basicNumber} · Destiny: {result.destinyNumber}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="save_cancel.cancel_button"
              onClick={() => {
                setSaveDialogOpen(false);
                setSaveName("");
              }}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              data-ocid="save_confirm.confirm_button"
              onClick={handleSaveConfirm}
              disabled={!saveName.trim() || createChart.isPending}
              className="font-body"
              style={{
                background: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              {createChart.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Chart"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Summary Pill ──────────────────────────────────────────────────────────────

function SummaryPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p
        className="font-body text-xs uppercase tracking-widest mb-1"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {label}
      </p>
      <p
        className="font-display text-4xl font-bold leading-none"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
