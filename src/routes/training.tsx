import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/gap-ui";
import { allGapRows, currentEmployee, gapRowsForEmployee, recommendationsFor, teamOf, useStore } from "@/lib/store";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training Recommendations — Skill Gap Analysis System" },
      { name: "description", content: "Course recommendations generated automatically from skill and gap level." },
      { property: "og:title", content: "Training Recommendations" },
      { property: "og:description", content: "Skill + gap level drives the recommended training plan." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  const { db, user } = useStore();
  const me = currentEmployee(db, user);

  const rows = useMemo(() => {
    if (user?.role === "admin") return allGapRows(db);
    if (user?.role === "manager" && me) return [me, ...teamOf(db, me._id)].flatMap((e) => gapRowsForEmployee(db, e));
    return me ? gapRowsForEmployee(db, me) : [];
  }, [db, me, user]);

  const recs = recommendationsFor(db, rows);
  const empById = new Map(db.employees.map((e) => [e._id, e]));
  const skillById = new Map(db.skills.map((s) => [s._id, s]));

  return (
    <AppShell title="Training Recommendations" subtitle="Recommended courses derived from skill and gap level">
      <SectionCard title={`${recs.length} recommendations`}>
        {recs.length ? (
          <div className="space-y-3">
            {recs.slice(0, 60).map(({ row, courses }, i) => (
              <div key={`${row.employeeId}-${row.skillId}-${i}`} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {skillById.get(row.skillId)?.name}
                    {user?.role !== "employee" && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {empById.get(row.employeeId)?.name}
                      </span>
                    )}
                  </p>
                  <StatusBadge status={row.status} label={`Gap ${row.gap}`} />
                </div>
                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                  {courses.map((c) => (
                    <li key={c._id} className="rounded-lg bg-secondary/60 p-3 text-sm">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.platform} · {c.duration} · {c.level} ·{" "}
                        {c.cost === 0 ? "Free" : `₹${c.cost.toLocaleString("en-IN")}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No training required" description="Every tracked skill meets its requirement." />
        )}
      </SectionCard>
    </AppShell>
  );
}