import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  IdCard,
  ListChecks,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, LevelBar, SectionCard, StatCard, StatusBadge } from "@/components/gap-ui";
import {
  allGapRows,
  currentEmployee,
  gapRowsForEmployee,
  recommendationsFor,
  teamOf,
  useStore,
} from "@/lib/store";
import {
  averageGap,
  criticalEmployees,
  employeesNeedingTraining,
  employeeStatus,
  filterRows,
  groupAverage,
  statusCounts,
  type Filters,
} from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Skill Gap Analysis System" },
      {
        name: "description",
        content: "Live organisation, team and personal skill-gap analytics with traffic-light criticality.",
      },
      { property: "og:title", content: "Dashboard — Skill Gap Analysis System" },
      { property: "og:description", content: "Live skill-gap analytics for HR, managers and employees." },
    ],
  }),
  component: DashboardPage,
});

const RYG = ["oklch(0.58 0.19 25)", "oklch(0.75 0.15 78)", "oklch(0.58 0.13 152)"];

function DashboardPage() {
  const { user } = useStore();
  if (user?.role === "employee") return <EmployeeDashboard />;
  if (user?.role === "manager") return <ManagerDashboard />;
  return <HRDashboard />;
}

/* ----------------------------- HR / ADMIN ----------------------------- */

function HRDashboard() {
  const { db } = useStore();
  const [filters, setFilters] = useState<Filters>({});
  const rows = useMemo(() => allGapRows(db), [db]);
  const filtered = useMemo(() => filterRows(db, rows, filters), [db, rows, filters]);

  const counts = statusCounts(filtered);
  const avg = averageGap(filtered);
  const training = employeesNeedingTraining(filtered);
  const critical = criticalEmployees(filtered);

  const byDept = useMemo(() => {
    const empById = new Map(db.employees.map((e) => [e._id, e]));
    const acc = groupAverage(filtered, (r) => empById.get(r.employeeId)?.departmentId);
    return db.departments
      .filter((d) => acc.has(d._id))
      .map((d) => ({
        name: d.name,
        gap: +(acc.get(d._id)!.total / acc.get(d._id)!.count).toFixed(2),
        critical: acc.get(d._id)!.red,
      }));
  }, [db, filtered]);

  const byRole = useMemo(() => {
    const empById = new Map(db.employees.map((e) => [e._id, e]));
    const acc = groupAverage(filtered, (r) => empById.get(r.employeeId)?.roleId);
    return db.roles
      .filter((r) => acc.has(r._id))
      .map((r) => ({
        name: r.name,
        gap: +(acc.get(r._id)!.total / acc.get(r._id)!.count).toFixed(2),
      }));
  }, [db, filtered]);

  const distribution = useMemo(() => {
    const buckets = [0, 1, 2, 3, 4].map((g) => ({
      name: `Gap ${g}`,
      count: filtered.filter((r) => r.gap === g).length,
    }));
    return buckets.filter((b) => b.count > 0);
  }, [filtered]);

  const topSkillGaps = useMemo(() => {
    const acc = groupAverage(filtered, (r) => r.skillId);
    const skillById = new Map(db.skills.map((s) => [s._id, s]));
    return [...acc.entries()]
      .map(([skillId, v]) => ({
        name: skillById.get(skillId)?.name ?? skillId,
        gap: +(v.total / v.count).toFixed(2),
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10);
  }, [db, filtered]);

  const urgentEmployees = useMemo(() => {
    const empById = new Map(db.employees.map((e) => [e._id, e]));
    const deptById = new Map(db.departments.map((d) => [d._id, d]));
    const roleById = new Map(db.roles.map((r) => [r._id, r]));
    const acc = new Map<string, number>();
    filtered.filter((r) => r.gap >= 2).forEach((r) => acc.set(r.employeeId, (acc.get(r.employeeId) ?? 0) + 1));
    return [...acc.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, n]) => ({
        id,
        name: empById.get(id)?.name ?? id,
        dept: deptById.get(empById.get(id)?.departmentId ?? "")?.name ?? "—",
        role: roleById.get(empById.get(id)?.roleId ?? "")?.name ?? "—",
        criticalCount: n,
      }));
  }, [db, filtered]);

  const pie = [
    { name: "Critical (gap ≥ 2)", value: counts.RED },
    { name: "Monitor (gap = 1)", value: counts.YELLOW },
    { name: "On target (gap = 0)", value: counts.GREEN },
  ];

  return (
    <AppShell
      title="Organisation Dashboard"
      subtitle="Required proficiency versus validated capability across the organisation"
      allow={["admin"]}
      actions={
        <Button asChild variant="outline">
          <Link to="/reports">Generate report</Link>
        </Button>
      }
    >
      <FilterBar filters={filters} setFilters={setFilters} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={db.employees.length} icon={<Users className="size-4" />} />
        <StatCard label="Departments" value={db.departments.length} icon={<Building2 className="size-4" />} />
        <StatCard label="Job Roles" value={db.roles.length} icon={<IdCard className="size-4" />} />
        <StatCard label="Skills Tracked" value={db.skills.length} icon={<Target className="size-4" />} />
        <StatCard
          label="Employees Requiring Training"
          value={training.size}
          hint="At least one skill below requirement"
          tone="warning"
          icon={<GraduationCap className="size-4" />}
        />
        <StatCard
          label="Critical Skill Gaps"
          value={counts.RED}
          hint={`${critical.size} employees affected`}
          tone="danger"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          label="Average Skill Gap"
          value={avg.toFixed(2)}
          hint="Across all assessed role skills"
          icon={<TrendingDown className="size-4" />}
        />
        <StatCard
          label="Training Requirements"
          value={counts.RED + counts.YELLOW}
          hint="Skill instances needing action"
          tone="success"
          icon={<ListChecks className="size-4" />}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SectionCard title="Average Skill Gap by Department">
          <ChartFrame>
            <BarChart data={byDept}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 252)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals />
              <Tooltip />
              <Bar dataKey="gap" name="Avg gap" fill="oklch(0.42 0.1 248)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Average Skill Gap by Job Role">
          <ChartFrame>
            <BarChart data={byRole} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.91 0.01 252)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <Bar dataKey="gap" name="Avg gap" fill="oklch(0.55 0.09 230)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Gap Distribution">
          <ChartFrame>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 252)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Skill instances" fill="oklch(0.62 0.08 200)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Red / Yellow / Green Distribution">
          <ChartFrame>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {pie.map((_, i) => (
                  <Cell key={i} fill={RYG[i]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Top 10 Skill Gaps" description="Highest average gap across filtered population">
          <ChartFrame height={320}>
            <BarChart data={topSkillGaps} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.91 0.01 252)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <Bar dataKey="gap" name="Avg gap" fill="oklch(0.58 0.19 25)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Employees Requiring Urgent Training">
          {urgentEmployees.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Employee</th>
                    <th className="py-2 pr-3">Department</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 text-right">Critical gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentEmployees.map((e) => (
                    <tr key={e.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">{e.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.dept}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.role}</td>
                      <td className="py-2 text-right">
                        <StatusBadge status="RED" label={`${e.criticalCount}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No urgent training required" description="No critical gaps in the current filter." />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}

function ChartFrame({ children, height = 260 }: { children: React.ReactElement; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function FilterBar({
  filters,
  setFilters,
  scopeEmployees,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  scopeEmployees?: string[];
}) {
  const { db } = useStore();
  const employees = scopeEmployees
    ? db.employees.filter((e) => scopeEmployees.includes(e._id))
    : db.employees;

  const set = (k: keyof Filters, v: string) => setFilters({ ...filters, [k]: v === "all" ? "" : v });

  return (
    <div className="card-surface flex flex-wrap gap-3 p-4">
      <FilterSelect
        label="Department"
        value={filters.departmentId || "all"}
        onChange={(v) => set("departmentId", v)}
        options={db.departments.map((d) => ({ value: d._id, label: d.name }))}
      />
      <FilterSelect
        label="Role"
        value={filters.roleId || "all"}
        onChange={(v) => set("roleId", v)}
        options={db.roles.map((r) => ({ value: r._id, label: r.name }))}
      />
      <FilterSelect
        label="Skill"
        value={filters.skillId || "all"}
        onChange={(v) => set("skillId", v)}
        options={db.skills.map((s) => ({ value: s._id, label: s.name }))}
      />
      <FilterSelect
        label="Employee"
        value={filters.employeeId || "all"}
        onChange={(v) => set("employeeId", v)}
        options={employees.map((e) => ({ value: e._id, label: e.name }))}
      />
      <FilterSelect
        label="Gap status"
        value={filters.status || "all"}
        onChange={(v) => set("status", v)}
        options={[
          { value: "RED", label: "Critical" },
          { value: "YELLOW", label: "Monitor" },
          { value: "GREEN", label: "On target" },
        ]}
      />
      <div className="flex items-end">
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="min-w-40 flex-1">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------ MANAGER ------------------------------ */

function ManagerDashboard() {
  const { db, user } = useStore();
  const me = currentEmployee(db, user);
  const team = me ? teamOf(db, me._id) : [];
  const rows = useMemo(() => team.flatMap((e) => gapRowsForEmployee(db, e)), [db, team]);
  const counts = statusCounts(rows);
  const pending = db.assessments.filter(
    (a) => team.some((t) => t._id === a.employeeId) && a.status === "submitted",
  ).length;

  const perEmployee = team.map((e) => {
    const r = gapRowsForEmployee(db, e);
    return { employee: e, rows: r, avg: averageGap(r), status: employeeStatus(r) };
  });

  return (
    <AppShell
      title="Team Dashboard"
      subtitle={`Capability overview for your team of ${team.length}`}
      allow={["manager"]}
      actions={
        <Button asChild>
          <Link to="/reviews">Review assessments</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team Members" value={team.length} icon={<Users className="size-4" />} />
        <StatCard label="Critical Gaps" value={counts.RED} tone="danger" icon={<AlertTriangle className="size-4" />} />
        <StatCard label="Monitor" value={counts.YELLOW} tone="warning" icon={<Target className="size-4" />} />
        <StatCard label="Pending Reviews" value={pending} icon={<ListChecks className="size-4" />} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SectionCard title="Average Gap per Team Member">
          <ChartFrame>
            <BarChart data={perEmployee.map((p) => ({ name: p.employee.name, gap: +p.avg.toFixed(2) }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 252)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="gap" name="Avg gap" fill="oklch(0.42 0.1 248)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Team Status Mix">
          <ChartFrame>
            <PieChart>
              <Pie
                data={[
                  { name: "Critical", value: counts.RED },
                  { name: "Monitor", value: counts.YELLOW },
                  { name: "On target", value: counts.GREEN },
                ]}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
              >
                {RYG.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ChartFrame>
        </SectionCard>
      </div>

      <SectionCard className="mt-5" title="Team Members">
        {perEmployee.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Avg gap</th>
                  <th className="py-2 pr-3">Critical</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {perEmployee.map((p) => (
                  <tr key={p.employee._id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{p.employee.name}</td>
                    <td className="py-2 pr-3">{p.avg.toFixed(2)}</td>
                    <td className="py-2 pr-3">{p.rows.filter((r) => r.gap >= 2).length}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/reviews" search={{ employeeId: p.employee._id }}>
                          Assess
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No team members assigned" />
        )}
      </SectionCard>
    </AppShell>
  );
}

/* ------------------------------ EMPLOYEE ------------------------------ */

function EmployeeDashboard() {
  const { db, user } = useStore();
  const me = currentEmployee(db, user);
  const rows = useMemo(() => (me ? gapRowsForEmployee(db, me) : []), [db, me]);
  const skillById = new Map(db.skills.map((s) => [s._id, s]));
  const dept = db.departments.find((d) => d._id === me?.departmentId);
  const role = db.roles.find((r) => r._id === me?.roleId);
  const recs = recommendationsFor(db, rows).slice(0, 4);
  const strengths = rows.filter((r) => r.gap === 0);
  const gaps = rows.filter((r) => r.gap >= 1).sort((a, b) => b.gap - a.gap);
  const progress = rows.length ? Math.round((strengths.length / rows.length) * 100) : 0;

  if (!me) {
    return (
      <AppShell title="My Dashboard">
        <EmptyState title="No employee record linked to this account" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Welcome back, ${me.name.split(" ")[0]}`}
      subtitle="Your capability against the requirements of your job role"
      actions={
        <Button asChild>
          <Link to="/assessment">Self assessment</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Employee ID" value={me.employeeCode} icon={<IdCard className="size-4" />} />
        <StatCard label="Department" value={<span className="text-lg">{dept?.name ?? "—"}</span>} icon={<Building2 className="size-4" />} />
        <StatCard label="Job Role" value={<span className="text-lg">{role?.name ?? "—"}</span>} icon={<Target className="size-4" />} />
        <StatCard
          label="Development Progress"
          value={`${progress}%`}
          hint={`${strengths.length} of ${rows.length} skills at or above requirement`}
          tone="success"
          icon={<GraduationCap className="size-4" />}
        />
      </div>

      <SectionCard className="mt-5" title="Skill Overview" description="Required versus validated proficiency">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Skill</th>
                <th className="py-2 pr-3">Required</th>
                <th className="py-2 pr-3">Self</th>
                <th className="py-2 pr-3">Manager</th>
                <th className="py-2 pr-3">Actual</th>
                <th className="py-2 pr-3">Progress</th>
                <th className="py-2 pr-3">Gap</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.skillId} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 font-medium">{skillById.get(r.skillId)?.name}</td>
                  <td className="py-2 pr-3">{r.requiredLevel}</td>
                  <td className="py-2 pr-3">{r.selfRating ?? "—"}</td>
                  <td className="py-2 pr-3">{r.managerRating ?? "—"}</td>
                  <td className="py-2 pr-3 font-semibold">{r.actualLevel ?? "—"}</td>
                  <td className="py-2 pr-3">
                    <LevelBar required={r.requiredLevel} actual={r.actualLevel} />
                  </td>
                  <td className="py-2 pr-3">{r.gap}</td>
                  <td className="py-2">
                    <StatusBadge status={r.status} label={r.exceeds ? "Requirement Met" : undefined} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <SectionCard title="My Skill Gaps">
          {gaps.length ? (
            <ul className="space-y-2">
              {gaps.map((g) => (
                <li key={g.skillId} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                  <span className="text-sm font-medium">{skillById.get(g.skillId)?.name}</span>
                  <StatusBadge status={g.status} label={`Gap ${g.gap}`} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No gaps — you meet every requirement" />
          )}
        </SectionCard>

        <SectionCard title="My Strengths">
          {strengths.length ? (
            <ul className="space-y-2">
              {strengths.map((g) => (
                <li key={g.skillId} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                  <span className="text-sm font-medium">{skillById.get(g.skillId)?.name}</span>
                  <StatusBadge status="GREEN" label={g.exceeds ? "Exceeds" : "On target"} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No skills at target yet" />
          )}
        </SectionCard>

        <SectionCard title="Recommended Training" actions={<Button asChild size="sm" variant="ghost"><Link to="/training">View all</Link></Button>}>
          {recs.length ? (
            <ul className="space-y-3">
              {recs.map(({ row, courses }) => (
                <li key={row.skillId} className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {skillById.get(row.skillId)?.name} · gap {row.gap}
                  </p>
                  <p className="mt-1 text-sm font-medium">{courses[0]!.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {courses[0]!.platform} · {courses[0]!.duration} ·{" "}
                    {courses[0]!.cost === 0 ? "Free" : `₹${courses[0]!.cost.toLocaleString("en-IN")}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No training required right now" />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}