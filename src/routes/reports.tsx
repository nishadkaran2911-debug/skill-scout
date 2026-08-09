import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatCard } from "@/components/gap-ui";
import { allGapRows, useStore } from "@/lib/store";
import { averageGap, countByStatus, downloadCsv, toCsv } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Skill Gap Analysis System" },
      { name: "description", content: "Organisation-wide skill gap reports with CSV export for HR review." },
      { property: "og:title", content: "Skill Gap Reports" },
      { property: "og:description", content: "Export organisation-wide gap analysis data." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { db } = useStore();
  const rows = allGapRows(db);
  const counts = countByStatus(rows);
  const empById = new Map(db.employees.map((e) => [e._id, e]));
  const skillById = new Map(db.skills.map((s) => [s._id, s]));

  function exportAll() {
    const csv = toCsv(
      ["Employee", "Department", "Skill", "Required", "Actual", "Gap", "Status"],
      rows.map((r) => {
        const e = empById.get(r.employeeId);
        return [
          e?.name ?? "",
          db.departments.find((d) => d._id === e?.departmentId)?.name ?? "",
          skillById.get(r.skillId)?.name ?? "",
          r.requiredLevel,
          r.actualLevel ?? "",
          r.gap,
          r.status,
        ];
      }),
    );
    downloadCsv("skill-gap-report.csv", csv);
  }

  return (
    <AppShell
      title="Reports"
      subtitle="Organisation-wide analysis"
      allow={["admin", "manager"]}
      actions={<Button onClick={exportAll}>Export CSV</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessed skill records" value={rows.length} />
        <StatCard label="Critical gaps" value={counts.critical} tone="danger" />
        <StatCard label="Moderate gaps" value={counts.moderate} tone="warning" />
        <StatCard label="Average gap" value={averageGap(rows).toFixed(2)} />
      </div>

      <SectionCard className="mt-5" title="Department summary">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Department</th>
                <th className="py-2 pr-3">Records</th>
                <th className="py-2 pr-3">Critical</th>
                <th className="py-2 pr-3">Moderate</th>
                <th className="py-2">Average gap</th>
              </tr>
            </thead>
            <tbody>
              {db.departments.map((d) => {
                const dr = rows.filter((r) => empById.get(r.employeeId)?.departmentId === d._id);
                const c = countByStatus(dr);
                return (
                  <tr key={d._id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{d.name}</td>
                    <td className="py-2 pr-3">{dr.length}</td>
                    <td className="py-2 pr-3 text-danger">{c.critical}</td>
                    <td className="py-2 pr-3 text-warning">{c.moderate}</td>
                    <td className="py-2">{averageGap(dr).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}