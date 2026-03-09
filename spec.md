# Vedic Numerology

## Current State
The app has:
- DOB input (day/month dropdowns + year scroll picker)
- Natal chart calculation and display (NatalChart component)
- Year chart grid (YearChartGrid) showing dasa + year number overlaid on natal chart per year
- Dasa cycle calculation (45-year cycle)
- Year number calculation (day + month + last two year digits + day-of-week number)
- Save/load charts to backend

## Requested Changes (Diff)

### Add
- **Month Chart feature**: When user taps on a year chart card (e.g. "2026-2027"), show a modal/expanded view with:
  1. **Natal chart** (left) — just the base natal numbers, no dasa/year overlay
  2. **Year chart** (right) — natal + dasa + year number overlaid (same as current year card)
  3. **Month charts grid below** — 9 mini charts showing each month period for that year

- **Month chart calculation logic**:
  - 360-day year: each number N has duration N×8 days
  - Sequence of months: starts at the year number, then continues 1,2,3,...9 cycling but starting from year number
  - Example: year number = 9 → sequence is 9,1,2,3,4,5,6,7,8 (each with N×8 days)
  - Duration: 9×8=72, 1×8=8, 2×8=16, 3×8=24, 4×8=32, 5×8=40, 6×8=48, 7×8=56, 8×8=64 = 360 days
  - Start date = birthday in that year (e.g. DOB 05-02-1998 → birthday in 2026 = 05/02/2026)
  - Each month chart shows: date range header (e.g. "5/2/2026 - 17/4/2026"), natal numbers in black, dasa in navy, year number in green, PLUS the month number in a distinct color (purple/orange per image)
  - Last 5 days of the year (days 361-365) show a special "no number" period with just a line

- **Month number color**: distinct from other colors — use purple (#7c3aed) for month number overlay in chart cells

### Modify
- **YearChartGrid**: each year card becomes clickable (cursor pointer, hover effect) — tapping opens the month chart detail view
- **Month detail view**: shown as a modal or expanded section below the clicked year card

### Remove
- Nothing removed

## Implementation Plan
1. Add `calculateMonthCycle` function to `numerology.ts`:
   - Input: day, month, birthYear, targetYear, yearNumber
   - Returns array of { monthNumber, startDate, endDate } for 9 periods (360 days from birthday)
   - Plus optional "remainder" period for days 361-365

2. Create `MonthChartModal.tsx` component:
   - Shows Natal chart + Year chart side by side at top
   - Shows grid of month charts (MonthPeriodChart) below
   - Each month chart is a mini NatalChart with monthNumber overlaid in purple
   - Header shows date range (e.g. "5/2/2026 - 17/4/2026")

3. Update `NatalChart.tsx`:
   - Add `monthNumber?: number` prop
   - Render month number in purple in the relevant cell

4. Update `YearChartGrid.tsx`:
   - Each card is clickable, opens MonthChartModal for that year
   - Pass DOB info down so month calculation is possible

5. Update `App.tsx`:
   - Pass day/month/year to YearChartGrid (already done)
   - No other changes needed
