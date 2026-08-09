import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/gap-ui";
import { currentEmployee, gapRowsForEmployee, teamOf, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  validateSearch: (s: Record<string, unknown>) => ({ employeeId: (s["employeeId"] as string) || "" }),
  head: () => ({
    meta: [
      { title: "Review & Validate — Skill Gap Analysis System" },
      {
        name: "description",
        content: "Managers and HR review self-assessments, give manager ratings and validate actual skill levels.",
      },
      { property: "og:title", content: "Review & Validate Assessments" },
      { property: "og:description", content: "Validate actual skill levels and recalculate gaps automatically." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { db, update, user, rubric } = useStore();
  const search = Route.useSearch();
  const me = currentEmployee(db, user);
  const isAdmin = user?.role === "admin";

  const candidates = useMemo(
    () => (isAdmin ? db.employees.filter((e) => e.status === "active") : me ? teamOf(db, me._id) : []),
    [db, isAdmin, me],
  );

  const [selected, setSelected] = useState(search.employeeId || candidates[0]?._id || "");
  const employee = candidates.find((e) => e._id === selected) ?? candidates[0];
  const skillById = new Map(db.skills.map((s) => [s._id, s]));
  const rows = employee ? gapRowsForEmployee(db, employee) : [];

  function setRating(skillId: string, value: number, field: "managerRating" | "hrOverride") {
    if (!employee) return;
    update((cur) => {
      const next = [...cur.assessments];
      const idx = next.findIndex((a) => a.employeeId === employee._id && a.skillId === skillId);
      if (idx >= 0) {
        next[idx] = {
          ...next[idx]!,
          [field]: value,
          status: "validated",
          assessedBy: user?._id ?? null,
          assessmentDate: new Date().toISOString(),
        };
      } else {
        next.push({
          _id: `as${employee._id}-${skillId}`,
          employeeId: employee._id,
          skillId,
          selfRating: null,
          managerRating: field === "managerRating" ? value : null,
          hrOverride: field === "hrOverride" ? value : null,
          comments: "",
          managerComments: "",
          status: "validated",
          assessmentDate: new Date().toISOString(),
          assessedBy: user?._id ?? null,
        });
      }
      return { ...cur, assessments: next };
    });
    toast.success("Validated level updated — skill gap recalculated");
  }

  function setComment(skillId: string, text: string) {
    if (!employee) return;
    update((cur) => ({
      ...cur,
      assessments: cur.assessments.map((a) =>
        a.employeeId === employee._id && a.skillId === skillId ? { ...a, managerComments: text } : a,
      ),
    }));
  }

  return (
    <AppShell
      title="Review & Validate Assessments"
      subtitle="Manager rating becomes the validated actual level; HR may override it"
      allow={["admin", "manager"]}
      actions={
        <div className="min-w-56">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {!employee ? (
        <EmptyState title="No employees to review" />
      ) : (
        <SectionCard
          title={employee.name}
          description={`${db.roles.find((r) => r._id === employee.roleId)?.name ?? ""} · ${db.departments.find((d) => d._id === employee.departmentId)?.name ?? ""}`}
        >
          <div className="space-y-4">
            {rows.map((r) => {
              const a = db.assessments.find((x) => x.employeeId === employee._id && x.skillId === r.skillId);
              return (
                <div key={r.skillId} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{skillById.get(r.skillId)?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Required {r.requiredLevel} · Self {r.selfRating ?? "—"} · Actual {r.actualLevel ?? "—"} · Gap{" "}
                        {r.gap}
                      </p>
                    </div>
                    <StatusBadge status={r.status} label={r.exceeds ? "Requirement Met" : undefined} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Manager rating</span>
                    {rubric.map((l) => (
                      <button
                        key={l.level}
                        type="button"
                        title={l.description}
                        onClick={() => setRating(r.skillId, l.level, "managerRating")}
                        className={cn(
                          "size-9 rounded-lg border text-sm font-semibold transition-colors",
                          r.managerRating === l.level
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        {l.level}
                      </button>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">HR override</span>
                      {rubric.map((l) => (
                        <button
                          key={l.level}
                          type="button"
                          onClick={() => setRating(r.skillId, l.level, "hrOverride")}
                          className={cn(
                            "size-9 rounded-lg border text-sm font-semibold transition-colors",
                            a?.hrOverride === l.level
                              ? "border-warning bg-warning text-warning-foreground"
                              : "border-border hover:bg-secondary",
                          )}
                        >
                          {l.level}
                        </button>
                      ))}
                    </div>
                  )}

                  <Textarea
                    className="mt-3"
                    rows={2}
                    maxLength={500}
                    placeholder="Manager comments…"
                    value={a?.managerComments ?? ""}
                    onChange={(e) => setComment(r.skillId, e.target.value)}
                  />
                  {a?.comments && (
                    <p className="mt-2 text-xs text-muted-foreground">Employee note: {a.comments}</p>
                  )}
                </div>
              );
            })}
          </div>
          <Button className="mt-4" onClick={() => toast.success("Review completed and gaps recalculated")}>
            Complete review
          </Button>
        </SectionCard>
      )}
    </AppShell>
  );
}