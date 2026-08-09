import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/gap-ui";
import { allGapRows, useStore } from "@/lib/store";
import { averageGap, employeeStatus } from "@/lib/analytics";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Skill Gap Analysis System" },
      { name: "description", content: "Departments, their managers, headcount and aggregated capability gaps." },
      { property: "og:title", content: "Department Management" },
      { property: "og:description", content: "Department-level capability and headcount overview." },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { db } = useStore();
  const rows = allGapRows(db);
  const empById = new Map(db.employees.map((e) => [e._id, e]));

  return (
    <AppShell title="Departments" subtitle="Structure and aggregated capability" allow={["admin"]}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {db.departments.map((d) => {
          const team = db.employees.filter((e) => e.departmentId === d._id);
          const deptRows = rows.filter((r) => empById.get(r.employeeId)?.departmentId === d._id);
          return (
            <SectionCard key={d._id} title={d.name} description={d.description}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Manager</dt>
                  <dd className="font-medium">{d.managerId ? empById.get(d.managerId)?.name : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Headcount</dt>
                  <dd className="font-medium">{team.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Average gap</dt>
                  <dd className="font-medium">{averageGap(deptRows).toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={employeeStatus(deptRows)} />
                  </dd>
                </div>
              </dl>
            </SectionCard>
          );
        })}
      </div>
    </AppShell>
  );
}