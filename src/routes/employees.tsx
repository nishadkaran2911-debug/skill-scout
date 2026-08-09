import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/gap-ui";
import { currentEmployee, gapRowsForEmployee, teamOf, useStore } from "@/lib/store";
import { averageGap, employeeStatus } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "Employees — Skill Gap Analysis System" },
      { name: "description", content: "Search, filter and manage employees with their live skill-gap status." },
      { property: "og:title", content: "Employee Management" },
      { property: "og:description", content: "Manage employees and monitor their capability status." },
    ],
  }),
  component: EmployeesPage,
});

const PAGE_SIZE = 8;

function EmployeesPage() {
  const { db, update, user } = useStore();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const me = currentEmployee(db, user);
  const isAdmin = user?.role === "admin";

  const scope = isAdmin ? db.employees : me ? teamOf(db, me._id) : [];
  const deptById = new Map(db.departments.map((d) => [d._id, d]));
  const roleById = new Map(db.roles.map((r) => [r._id, r]));
  const empById = new Map(db.employees.map((e) => [e._id, e]));

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return scope
      .filter(
        (e) =>
          !term ||
          [e.name, e.email, e.employeeCode, deptById.get(e.departmentId)?.name, roleById.get(e.roleId)?.name]
            .join(" ")
            .toLowerCase()
            .includes(term),
      )
      .map((e) => {
        const g = gapRowsForEmployee(db, e);
        return { e, status: employeeStatus(g), avg: averageGap(g) };
      })
      .sort((a, b) => b.avg - a.avg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, q, scope]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function toggleStatus(id: string) {
    update((cur) => ({
      ...cur,
      employees: cur.employees.map((e) =>
        e._id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e,
      ),
    }));
    toast.success("Employee status updated");
  }

  return (
    <AppShell
      title="Employee Management"
      subtitle={`${rows.length} employees in scope`}
      allow={["admin", "manager"]}
    >
      <SectionCard>
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email, department or role…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>

        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Manager</th>
                  <th className="py-2 pr-3">Gap status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ e, status, avg }) => (
                  <tr key={e._id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs">{e.employeeCode}</td>
                    <td className="py-2 pr-3 font-medium">
                      {e.name}
                      {e.status === "inactive" && (
                        <span className="ml-2 rounded bg-neutral-soft px-1.5 py-0.5 text-[10px]">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{e.email}</td>
                    <td className="py-2 pr-3">{deptById.get(e.departmentId)?.name}</td>
                    <td className="py-2 pr-3">{roleById.get(e.roleId)?.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {e.managerId ? empById.get(e.managerId)?.name : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={status} label={`Avg ${avg.toFixed(2)}`} />
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/skill-gaps">Skill gaps</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/reviews" search={{ employeeId: e._id }}>
                            Assessment
                          </Link>
                        </Button>
                        {user?.role === "admin" && (
                          <Button size="sm" variant="ghost" onClick={() => toggleStatus(e._id)}>
                            {e.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No employees found" description="Adjust your search term." />
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}