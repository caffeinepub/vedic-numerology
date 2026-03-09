# Vedic Numerology

## Current State
App has two tabs: New Chart and Saved Charts. New Chart allows DOB input and shows natal + year/dasa charts with drill-down to month and day. Saved Charts lists saved natal charts.

## Requested Changes (Diff)

### Add
- New "Comparison" tab (3rd tab) in the main tab bar
- Input form: Person 1 DOB (day/month dropdowns + year scroll picker), Person 2 DOB (day/month dropdowns + year scroll picker), shared From Year / To Year range
- "Show Chart" button to display comparison
- "Go Back" button to return to the input form from the comparison view
- Side-by-side natal chart display: Person 1 chart on the left, Person 2 chart on the right, each with basic/destiny summary pills above
- Side-by-side year/dasa chart grids below the natal charts for the shared year range
- No compatibility score -- visual comparison only

### Modify
- TabsList to include 3rd trigger for Comparison tab

### Remove
- Nothing removed

## Implementation Plan
1. Add `comparison` tab trigger to TabsList
2. Create ComparisonTab component in App.tsx or separate file
3. ComparisonTab state: person1 DOB, person2 DOB, fromYear, toYear, showComparison boolean
4. Form view: Person 1 section, Person 2 section, shared year range, Show Chart + Cancel/Go Back buttons
5. Results view: side-by-side natal charts with summary pills, then side-by-side YearChartGrid components
6. Go Back button resets showComparison to false
