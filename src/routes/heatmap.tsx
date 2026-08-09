import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard } from "@/components/gap-ui";
import { allGapRows, currentEmployee, gapRowsForEmployee, teamOf, useStore } from "@/lib/store";
import { averageGap, gapStatusOf } from "@/lib/heatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/heatmap")({
  head: () => ({
    meta: [
      { title: "Skill Gap Heatmap — Skill Gap Analysis System" },
      {
        name: "description",
        content: "Employee-by-skill heatmap with red, yellow and green criticality plus department roll-ups.",
      },
      { property: "og:title", content: "Skill Gap Heatmap" },
      { property: "og:description", content: "Visualise capability gaps across employees, teams and departments." },
    ],
  }),
  component: HeatmapPage,
});

const CELL: Record<string, string> = {
  RED: "bg-danger text-danger-foreground",
  YELLOW: "bg-warning text-warning-foreground",
  GREEN: "bg-success text-success-foreground",
  NA: "bg-neutral-soft text-muted-foreground",
};

function HeatmapPage() {
  const { db, user } = useStore();
  const [tab, setTab] = useState("employee");

  const scope = useMemo(() => {
    const me = currentEmployee(db, user);
    if (user?.role === "manager" && me) return [me, ...teamOf(db, me._id)];
    return db.employees.filter((e) => e.status === "active");
  }, [db, user]);

  const rows = useMemo(
    () => (user?.role === "admin" ? allGapRows(db) : scope.flatMap((e) => gapRowsForEmployee(db, e))),
    [db, scope, user],
  );

  const skillIds = useMemo(() => {
    const ids = new Set(rows.map((r) => r.skillId));
    return db.skills.filter((s) => ids.has(s._id));
  }, [db.skills, rows]);

  const cellFor = (employeeId: string, skillId: string) =>
    rows.find((r) => r.employeeId === employeeId && r.skillId === skillId);

  const deptById = new Map(db.departments.map((d) => [d._id, d]));
  const skillById = new Map(db.skills.map((s) => [s._id, s]));

  const deptMatrix = useMemo(() => {
    return db.departments.map((d) => {
      const empIds = scope.filter((e) => e.departmentId === d._id).map((e) => e._id);
      return {
        department: d,
        cells: skillIds.map((s) => {
          const rs = rows.filter((r) => empIds.includes(r.employeeId) && r.skillId === s._id);
          return { skill: s, avg: rs.length ? averageGap(rs) : null, count: rs.length };
        }),
      };
    });
  }, [db.departments, rows, scope, skillIds]);

  return (
    <AppShell
      title="Skill Gap Heatmap"
      subtitle="Hover any cell for required, actual and gap detail"
      allow={["admin", "manager"]}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        {([
          ["RED", "Gap ≥ 2 · Urgent Training"],
          ["YELLOW", "Gap = 1 · Monitor"],
          ["GREEN", "Gap = 0 · No Action"],
          ["NA", "Not assessed"],
        ] as const).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className={cn("size-3 rounded", CELL[k])} />
            {label}
          </span>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="employee">Employee × Skill</TabsTrigger>
          <TabsTrigger value="department">Department × Skill</TabsTrigger>
        </TabsList>

        <TabsContent value="employee" className="mt-4">
          <SectionCard>
            {scope.length ? (
              <div className="overflow-x-auto">
                <table className="border-separate border-spacing-1 text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-semibold">Employee</th>
                      {skillIds.map((s) => (
                        <th key={s._id} className="h-28 w-8 align-bottom">
                          <span className="block origin-bottom-left translate-x-3 -rotate-60 whitespace-nowrap text-left text-[10px] text-muted-foreground">
                            {s.name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scope.map((e) => (
                      <tr key={e._id}>
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-1 font-medium">
                          {e.name}
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            {deptById.get(e.departmentId)?.name}
                          </span>
                        </td>
                        {skillIds.map((s) => {
                          const c = cellFor(e._id, s._id);
                          const key = c ? (c.assessed ? c.status : "NA") : "NA";
                          return (
                            <td key={s._id}>
                              <div
                                title={
                                  c
                                    ? `${e.name}\n${s.name}\nRequired: ${c.requiredLevel}\nActual: ${c.actualLevel ?? "Not assessed"}\nGap: ${c.gap}\nStatus: ${c.status}${c.exceeds ? " (Requirement Met)" : ""}`
                                    : `${e.name}\n${s.name}\nNot part of this job role`
                                }
                                className={cn(
                                  "flex size-8 items-center justify-center rounded font-semibold",
                                  c ? CELL[key] : "bg-background border border-dashed border-border",
                                )}
                              >
                                {c ? (c.assessed ? c.gap : "?") : ""}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No employees in scope" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="department" className="mt-4">
          <SectionCard description="Average gap per department and skill (blank = skill not required in that department)">
            <div className="overflow-x-auto">
              <table className="border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-semibold">Department</th>
                    {skillIds.map((s) => (
                      <th key={s._id} className="h-28 w-10 align-bottom">
                        <span className="block origin-bottom-left translate-x-3 -rotate-60 whitespace-nowrap text-left text-[10px] text-muted-foreground">
                          {s.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptMatrix.map((d) => (
                    <tr key={d.department._id}>
                      <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-1 font-medium">
                        {d.department.name}
                      </td>
                      {d.cells.map((c) => (
                        <td key={c.skill._id}>
                          <div
                            title={
                              c.avg == null
                                ? `${d.department.name}\n${skillById.get(c.skill._id)?.name}\nNot required`
                                : `${d.department.name}\n${c.skill.name}\nAverage gap: ${c.avg.toFixed(2)}\nEmployees: ${c.count}`
                            }
                            className={cn(
                              "flex h-8 w-10 items-center justify-center rounded font-semibold",
                              c.avg == null
                                ? "border border-dashed border-border bg-background"
                                : CELL[gapStatusOf(c.avg)],
                            )}
                          >
                            {c.avg == null ? "" : c.avg.toFixed(1)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}