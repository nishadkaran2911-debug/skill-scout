import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FilterBar } from "@/routes/dashboard";
import { EmptyState, LevelBar, SectionCard, StatCard, StatusBadge } from "@/components/gap-ui";
import { allGapRows, currentEmployee, gapRowsForEmployee, teamOf, useStore } from "@/lib/store";
import { averageGap, filterRows, statusCounts, toCSV, downloadFile, type Filters } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/skill-gaps")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analysis — Skill Gap Analysis System" },
      {
        name: "description",
        content: "Row-level skill-gap analysis comparing required and validated proficiency for every employee.",
      },
      { property: "og:title", content: "Skill Gap Analysis" },
      { property: "og:description", content: "Required versus actual proficiency, with traffic-light criticality." },
    ],
  }),
  component: SkillGapsPage,
});

function SkillGapsPage() {
  const { db, user } = useStore();
  const [filters, setFilters] = useState<Filters>({});

  const scope = useMemo(() => {
    const me = currentEmployee(db, user);
    if (user?.role === "employee") return me ? [me] : [];
    if (user?.role === "manager" && me) return [me, ...teamOf(db, me._id)];
    return db.employees.filter((e) => e.status === "active");
  }, [db, user]);

  const rows = useMemo(() => {
    if (user?.role === "admin") return allGapRows(db);
    return scope.flatMap((e) => gapRowsForEmployee(db, e));
  }, [db, scope, user]);

  const filtered = filterRows(db, rows, filters);
  const counts = statusCounts(filtered);
  const empById = new Map(db.employees.map((e) => [e._id, e]));
  const skillById = new Map(db.skills.map((s) => [s._id, s]));
  const roleById = new Map(db.roles.map((r) => [r._id, r]));
  const deptById = new Map(db.departments.map((d) => [d._id, d]));

  function exportCsv() {
    downloadFile(
      "skill-gap-analysis.csv",
      toCSV(
        filtered.map((r) => {
          const e = empById.get(r.employeeId)!;
          return {
            "Employee ID": e.employeeCode,
            Employee: e.name,
            Department: deptById.get(e.departmentId)?.name ?? "",
            Role: roleById.get(e.roleId)?.name ?? "",
            Skill: skillById.get(r.skillId)?.name ?? "",
            Required: r.requiredLevel,
            Self: r.selfRating ?? "",
            Manager: r.managerRating ?? "",
            Actual: r.actualLevel ?? "",
            Gap: r.gap,
            Status: r.status,
            Action: r.action,
          };
        }),
      ),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <AppShell
      title="Skill Gap Analysis"
      subtitle="Skill Gap = Required Level − Validated Actual Level (never negative for action)"
      actions={
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <FilterBar filters={filters} setFilters={setFilters} scopeEmployees={scope.map((e) => e._id)} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Skill Instances" value={filtered.length} />
        <StatCard label="Critical (gap ≥ 2)" value={counts.RED} tone="danger" />
        <StatCard label="Monitor (gap = 1)" value={counts.YELLOW} tone="warning" />
        <StatCard label="Average Gap" value={averageGap(filtered).toFixed(2)} tone="success" />
      </div>

      <SectionCard className="mt-5" title={`${filtered.length} results`}>
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-220 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3">Skill</th>
                  <th className="py-2 pr-3">Required</th>
                  <th className="py-2 pr-3">Self</th>
                  <th className="py-2 pr-3">Manager</th>
                  <th className="py-2 pr-3">Actual</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Gap</th>
                  <th className="py-2">Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 300).map((r, i) => {
                  const e = empById.get(r.employeeId)!;
                  return (
                    <tr key={`${r.employeeId}-${r.skillId}-${i}`} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">{e.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{deptById.get(e.departmentId)?.name}</td>
                      <td className="py-2 pr-3">{skillById.get(r.skillId)?.name}</td>
                      <td className="py-2 pr-3">{r.requiredLevel}</td>
                      <td className="py-2 pr-3">{r.selfRating ?? "—"}</td>
                      <td className="py-2 pr-3">{r.managerRating ?? "—"}</td>
                      <td className="py-2 pr-3 font-semibold">{r.actualLevel ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <LevelBar required={r.requiredLevel} actual={r.actualLevel} />
                      </td>
                      <td className="py-2 pr-3">{r.gap}</td>
                      <td className="py-2">
                        <StatusBadge status={r.status} label={r.exceeds ? "Requirement Met" : r.action} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 300 && (
              <p className="pt-3 text-xs text-muted-foreground">
                Showing the first 300 rows — narrow the filters or export to CSV for the full set.
              </p>
            )}
          </div>
        ) : (
          <EmptyState title="No matching skill records" description="Try clearing one or more filters." />
        )}
      </SectionCard>
    </AppShell>
  );
}