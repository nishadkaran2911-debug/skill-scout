import type { DB } from "./seed";
import type { GapRow, GapStatus } from "./domain";

export interface Filters {
  departmentId?: string;
  roleId?: string;
  skillId?: string;
  employeeId?: string;
  status?: GapStatus | "";
}

export function filterRows(db: DB, rows: GapRow[], f: Filters): GapRow[] {
  const empById = new Map(db.employees.map((e) => [e._id, e]));
  return rows.filter((r) => {
    const emp = empById.get(r.employeeId);
    if (!emp) return false;
    if (f.departmentId && emp.departmentId !== f.departmentId) return false;
    if (f.roleId && emp.roleId !== f.roleId) return false;
    if (f.employeeId && emp._id !== f.employeeId) return false;
    if (f.skillId && r.skillId !== f.skillId) return false;
    if (f.status && r.status !== f.status) return false;
    return true;
  });
}

export function statusCounts(rows: GapRow[]) {
  return {
    RED: rows.filter((r) => r.status === "RED").length,
    YELLOW: rows.filter((r) => r.status === "YELLOW").length,
    GREEN: rows.filter((r) => r.status === "GREEN").length,
  };
}

export function averageGap(rows: GapRow[]) {
  if (!rows.length) return 0;
  return rows.reduce((sum, r) => sum + r.gap, 0) / rows.length;
}

export function groupAverage<T extends string>(rows: GapRow[], keyOf: (r: GapRow) => T | undefined) {
  const acc = new Map<T, { total: number; count: number; red: number }>();
  rows.forEach((r) => {
    const k = keyOf(r);
    if (!k) return;
    const cur = acc.get(k) ?? { total: 0, count: 0, red: 0 };
    cur.total += r.gap;
    cur.count += 1;
    if (r.status === "RED") cur.red += 1;
    acc.set(k, cur);
  });
  return acc;
}

export function employeesNeedingTraining(rows: GapRow[]) {
  return new Set(rows.filter((r) => r.gap >= 1).map((r) => r.employeeId));
}

export function criticalEmployees(rows: GapRow[]) {
  return new Set(rows.filter((r) => r.gap >= 2).map((r) => r.employeeId));
}

export function employeeStatus(rows: GapRow[]): GapStatus {
  if (rows.some((r) => r.status === "RED")) return "RED";
  if (rows.some((r) => r.status === "YELLOW")) return "YELLOW";
  return "GREEN";
}

export function toCSV(rows: Array<Record<string, string | number>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))].join("\n");
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}