/**
 * Vedic Numerology calculation utilities
 */

export interface NumerologyResult {
  basicNumber: number;
  destinyNumber: number;
  chartNumbers: number[]; // all numbers placed (with repetition)
  cellCounts: Record<number, number>; // count of each digit 1-9
}

/**
 * Reduce a number to single digit (1-9) by summing digits.
 * Note: 0 stays 0 (but we skip 0s when placing in chart).
 */
function reduceToSingleDigit(input: number): number {
  let n = input;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number.parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Extract individual non-zero digits from a number.
 * e.g. 22 → [2, 2], 5 → [5], 11 → [1, 1], 3 → [3], 0 → []
 */
function getIndividualDigits(n: number): number[] {
  return String(n)
    .split("")
    .map(Number)
    .filter((d) => d !== 0);
}

/**
 * Calculate all numerology values from a DOB string (DD-MM-YYYY or DD/MM/YYYY)
 *
 * Chart placement rules:
 * 1. Raw digits of the date (DD) placed individually (e.g. 22 → place 2, 2)
 * 2. Basic number (reduced date to single digit) placed once more
 * 3. Raw digits of the month (MM) placed individually (e.g. 11 → place 1, 1)
 * 4. Last two digits of year placed individually, skip zeros
 * 5. Destiny number placed once
 *
 * Destiny = sum of ALL digits of full DOB (DD+MM+YYYY) reduced to single digit.
 */
export function calculateNumerology(dob: string): NumerologyResult {
  // Parse DOB - support both - and / separators
  const parts = dob.split(/[-/]/);
  if (parts.length !== 3) {
    throw new Error("Invalid DOB format. Use DD-MM-YYYY");
  }

  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const year = Number.parseInt(parts[2], 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    throw new Error("Invalid date values");
  }

  // Basic number: sum digits of day until single digit
  const basicNumber = reduceToSingleDigit(day);

  // Destiny number: sum ALL digits of full DOB string (DD + MM + YYYY)
  const dobDigits = dob.replace(/[-/]/g, "").split("").map(Number);
  const destinySum = dobDigits.reduce((a, b) => a + b, 0);
  const destinyNumber = reduceToSingleDigit(destinySum);

  const chartNumbers: number[] = [];

  // 1. Individual digits of date + basic number placement
  // "Simple dates" (1-9, 10, 20, 30): place digits once only — basic number is the same, no extra entry
  // "Compound dates" (11-19, 21-29, 31): place both digits AND also the basic number separately
  const simpleDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30];
  const isSimpleDate = simpleDates.includes(day);

  const dayDigits = getIndividualDigits(day);
  for (const d of dayDigits) {
    chartNumbers.push(d);
  }

  // 2. Basic number — only add separately for compound dates
  if (!isSimpleDate) {
    chartNumbers.push(basicNumber);
  }

  // 3. Individual digits of month (e.g. month=11 → 1, 1; month=3 → 3; month=12 → 1, 2)
  const monthDigits = getIndividualDigits(month);
  for (const d of monthDigits) {
    chartNumbers.push(d);
  }

  // 4. Last two digits of year, individually, skip zeros
  const yearStr = String(year).padStart(4, "0");
  const lastTwoDigits = yearStr.slice(-2).split("").map(Number);
  for (const d of lastTwoDigits) {
    if (d !== 0) {
      chartNumbers.push(d);
    }
  }

  // 5. Destiny number
  chartNumbers.push(destinyNumber);

  // Count occurrences of each number 1-9
  const cellCounts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    cellCounts[i] = 0;
  }
  for (const n of chartNumbers) {
    if (n >= 1 && n <= 9) {
      cellCounts[n] = (cellCounts[n] || 0) + 1;
    }
  }

  return { basicNumber, destinyNumber, chartNumbers, cellCounts };
}

/**
 * Get the string to display in a natal chart cell for a given number
 * Returns the number repeated by its count (e.g. 3 times 7 → "777")
 */
export function getCellDisplay(
  number: number,
  cellCounts: Record<number, number>,
): string {
  const count = cellCounts[number] || 0;
  if (count === 0) return "";
  return String(number).repeat(count);
}

/**
 * The fixed grid layout: [row][col] → number
 * Top:    3 1 9
 * Middle: 6 7 5
 * Bottom: 2 8 4
 */
export const GRID_LAYOUT: number[][] = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

/**
 * Validate a DOB string DD-MM-YYYY
 */
export function validateDOB(
  day: number,
  month: number,
  year: number,
): string | null {
  if (day < 1 || day > 31) return "Day must be between 1 and 31";
  if (month < 1 || month > 12) return "Month must be between 1 and 12";
  if (year < 1900 || year > 2100) return "Year must be between 1900 and 2100";

  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth)
    return `${getMonthName(month)} has only ${daysInMonth} days`;

  return null;
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1] || "";
}

export function formatDOB(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year)}`;
}

// ─── Day-of-Week Planet Numbers ─────────────────────────────────────────────

/**
 * Day-of-week planet numbers:
 * Sun=1, Mon=2, Tue=9, Wed=5, Thu=3, Fri=6, Sat=8
 */
export function getDayOfWeekNumber(date: Date): number {
  const map = [1, 2, 9, 5, 3, 6, 8]; // index 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  return map[date.getDay()];
}

// ─── Year Number ────────────────────────────────────────────────────────────

/**
 * Calculate year number for a person with given DOB in a specific calendar year.
 * Formula: day + month + (each non-zero digit of last two digits of targetYear) + dayOfWeekNumber
 * Reduce sum to single digit 1-9.
 */
export function calculateYearNumber(
  day: number,
  month: number,
  targetYear: number,
): number {
  // Get the day of the week of the person's birthday in targetYear
  const birthdayInYear = new Date(targetYear, month - 1, day);
  const dayOfWeekNum = getDayOfWeekNumber(birthdayInYear);

  // Last two digits of targetYear, skip zeros
  const yearStr = String(targetYear).padStart(4, "0");
  const lastTwo = yearStr.slice(-2).split("").map(Number);

  let sum = day + month + dayOfWeekNum;
  for (const d of lastTwo) {
    if (d !== 0) sum += d;
  }

  return reduceToSingleDigit(sum);
}

// ─── Dasa Cycle ─────────────────────────────────────────────────────────────

export interface DasaPeriod {
  dasaNumber: number;
  startYear: number;
  endYear: number; // exclusive (period covers startYear to endYear - 1)
}

/**
 * Calculate the full 45-year dasa cycle starting from birthYear.
 * The cycle sequence starting at basicNumber: basicNumber, basicNumber+1, ..., 9, 1, 2, ..., basicNumber-1
 * Each period lasts N years where N = dasaNumber (1 through 9).
 * Total cycle = 5+6+7+8+9+1+2+3+4 = 45 years (the sequence always sums to 45).
 *
 * Returns only periods overlapping with [fromYear, toYear].
 */
// ─── Month Cycle ─────────────────────────────────────────────────────────────

export interface MonthPeriod {
  monthNumber: number; // 1-9
  startDate: Date;
  endDate: Date; // inclusive last day
}

/**
 * Calculate the 9 month periods for a 360-day numerology year.
 * Start = birthday in targetYear.
 * Sequence begins at yearNumber, then wraps through 1-9.
 * Each period N has duration N×8 days. Total = 360 days.
 * The remaining 5 days (days 361-365) are shown as a blank/line.
 */
export function calculateMonthCycle(
  day: number,
  month: number,
  targetYear: number,
  yearNumber: number,
): MonthPeriod[] {
  // Start = birthday in targetYear
  const startDate = new Date(targetYear, month - 1, day);

  // Sequence: yearNumber, then wrap through 1-9
  // e.g. yearNumber=9 → [9,1,2,3,4,5,6,7,8]
  const sequence: number[] = [];
  for (let i = 0; i < 9; i++) {
    sequence.push(((yearNumber - 1 + i) % 9) + 1);
  }

  const periods: MonthPeriod[] = [];
  let currentDate = new Date(startDate);

  for (const num of sequence) {
    const duration = num * 8; // days
    const periodStart = new Date(currentDate);
    const periodEnd = new Date(currentDate);
    periodEnd.setDate(periodEnd.getDate() + duration - 1); // inclusive

    periods.push({
      monthNumber: num,
      startDate: periodStart,
      endDate: periodEnd,
    });

    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + duration);
  }

  return periods; // 9 periods, total = 360 days
}

export function calculateDasaCycle(
  basicNumber: number,
  birthYear: number,
  fromYear: number,
  toYear: number,
): DasaPeriod[] {
  // Build the 45-year sequence starting from basicNumber
  const sequence: number[] = [];
  for (let i = 0; i < 9; i++) {
    const num = ((basicNumber - 1 + i) % 9) + 1;
    sequence.push(num);
  }

  // Generate periods, cycling as many times as needed to cover [fromYear, toYear]
  const result: DasaPeriod[] = [];
  let currentYear = birthYear;

  // We'll iterate enough cycles to cover toYear
  while (currentYear <= toYear) {
    for (const num of sequence) {
      const startYear = currentYear;
      const endYear = currentYear + num; // exclusive
      currentYear = endYear;

      // Check overlap with [fromYear, toYear]
      if (endYear > fromYear && startYear <= toYear) {
        result.push({ dasaNumber: num, startYear, endYear });
      }

      if (currentYear > toYear + 45) break;
    }
  }

  return result;
}
