import type { GapRow } from "./domain";

export { averageGap } from "./analytics";

/** Status key for an averaged (fractional) gap value. */
export function gapStatusOf(avg: number): "RED" | "YELLOW" | "GREEN" {
  if (avg >= 1.5) return "RED";
  if (avg >= 0.5) return "YELLOW";
  return "GREEN";
}

export function rowsFor(rows: GapRow[], employeeId: string) {
  return rows.filter((r) => r.employeeId === employeeId);
}