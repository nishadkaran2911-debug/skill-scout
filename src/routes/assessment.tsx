import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, History, Save, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/gap-ui";
import { currentEmployee, gapRowsForEmployee, useStore } from "@/lib/store";
import type { Assessment } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Self Assessment — Skill Gap Analysis System" },
      {
        name: "description",
        content: "Rate your proficiency from 1 to 5 against every skill required by your job role.",
      },
      { property: "og:title", content: "Self Assessment" },
      { property: "og:description", content: "Submit your skill self-assessment for manager validation." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { db, update, user, rubric } = useStore();
  const me = currentEmployee(db, user);
  const role = db.roles.find((r) => r._id === me?.roleId);
  const skillById = new Map(db.skills.map((s) => [s._id, s]));

  const existing = useMemo(
    () => new Map(db.assessments.filter((a) => a.employeeId === me?._id).map((a) => [a.skillId, a])),
    [db.assessments, me],
  );

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    (role?.requiredSkills ?? []).forEach((rs) => {
      const v = existing.get(rs.skillId)?.selfRating;
      if (v != null) init[rs.skillId] = v;
    });
    return init;
  });
  const [comments, setComments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (role?.requiredSkills ?? []).forEach((rs) => {
      init[rs.skillId] = existing.get(rs.skillId)?.comments ?? "";
    });
    return init;
  });

  if (!me || !role) {
    return (
      <AppShell title="Self Assessment">
        <EmptyState title="No job role assigned" description="Ask HR to assign a job role before assessing." />
      </AppShell>
    );
  }

  const grouped = role.requiredSkills.reduce<Record<string, typeof role.requiredSkills>>((acc, rs) => {
    const cat = skillById.get(rs.skillId)?.category ?? "Other";
    (acc[cat] ??= []).push(rs);
    return acc;
  }, {});

  const answered = Object.keys(ratings).length;
  const total = role.requiredSkills.length;

  function save(status: "draft" | "submitted") {
    if (status === "submitted" && answered < total) {
      toast.error(`Please rate all ${total} skills before submitting (${answered} completed).`);
      return;
    }
    update((cur) => {
      const next = [...cur.assessments];
      role!.requiredSkills.forEach((rs) => {
        const rating = ratings[rs.skillId];
        if (rating == null) return;
        const idx = next.findIndex((a) => a.employeeId === me!._id && a.skillId === rs.skillId);
        const base: Assessment = {
          _id: `as${me!._id}-${rs.skillId}`,
          employeeId: me!._id,
          skillId: rs.skillId,
          selfRating: rating,
          managerRating: null,
          hrOverride: null,
          comments: comments[rs.skillId] ?? "",
          managerComments: "",
          status,
          assessmentDate: new Date().toISOString(),
          assessedBy: null,
        };
        if (idx >= 0) {
          const prev = next[idx]!;
          next[idx] = {
            ...prev,
            selfRating: rating,
            comments: comments[rs.skillId] ?? "",
            status: status === "draft" ? "draft" : prev.managerRating != null ? "validated" : "submitted",
            assessmentDate: new Date().toISOString(),
          };
        } else {
          next.push(base);
        }
      });
      return { ...cur, assessments: next };
    });
    toast.success(status === "draft" ? "Draft saved" : "Assessment submitted for manager review");
  }

  const rows = gapRowsForEmployee(db, me);

  return (
    <AppShell
      title="Self Assessment"
      subtitle={`${role.name} · ${answered} of ${total} skills rated`}
      actions={
        <>
          <Button variant="outline" onClick={() => save("draft")}>
            <Save className="size-4" /> Save draft
          </Button>
          <Button onClick={() => save("submitted")}>
            <Send className="size-4" /> Submit assessment
          </Button>
        </>
      }
    >
      <SectionCard title="Proficiency rubric" description="Levels are defined organisation-wide by HR">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {rubric.map((l) => (
            <div key={l.level} className="rounded-lg border border-border p-3">
              <p className="font-display text-sm font-semibold">
                {l.level} · {l.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-5 space-y-5">
        {Object.entries(grouped).map(([category, items]) => (
          <SectionCard key={category} title={category} description={`${items.length} required skills`}>
            <div className="space-y-5">
              {items.map((rs) => {
                const skill = skillById.get(rs.skillId)!;
                const selected = ratings[rs.skillId];
                const a = existing.get(rs.skillId);
                return (
                  <div key={rs.skillId} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.description}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                        Required level {rs.requiredLevel}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {rubric.map((l) => (
                        <button
                          key={l.level}
                          type="button"
                          aria-pressed={selected === l.level}
                          onClick={() => setRatings((r) => ({ ...r, [rs.skillId]: l.level }))}
                          className={cn(
                            "min-w-16 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                            selected === l.level
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-secondary",
                          )}
                        >
                          {l.level}
                        </button>
                      ))}
                      {selected != null && (
                        <p className="flex-1 self-center text-xs text-muted-foreground">
                          <strong>{rubric.find((l) => l.level === selected)?.label}:</strong>{" "}
                          {rubric.find((l) => l.level === selected)?.description}
                        </p>
                      )}
                    </div>

                    <Textarea
                      className="mt-3"
                      rows={2}
                      maxLength={500}
                      placeholder="Optional comments (evidence, recent projects, context)…"
                      value={comments[rs.skillId] ?? ""}
                      onChange={(e) => setComments((c) => ({ ...c, [rs.skillId]: e.target.value }))}
                    />

                    {a?.managerRating != null && (
                      <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-success" />
                        Manager validated at level {a.managerRating}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        className="mt-5"
        title="Assessment history"
        description="Latest validated outcome for each of your role skills"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Skill</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Self</th>
                <th className="py-2 pr-3">Manager</th>
                <th className="py-2 pr-3">Actual</th>
                <th className="py-2 pr-3">Gap</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = existing.get(r.skillId);
                return (
                  <tr key={r.skillId} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{skillById.get(r.skillId)?.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {a ? new Date(a.assessmentDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2 pr-3">{r.selfRating ?? "—"}</td>
                    <td className="py-2 pr-3">{r.managerRating ?? "—"}</td>
                    <td className="py-2 pr-3 font-semibold">{r.actualLevel ?? "—"}</td>
                    <td className="py-2 pr-3">{r.gap}</td>
                    <td className="py-2">
                      <StatusBadge status={r.status} label={r.exceeds ? "Requirement Met" : undefined} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <History className="size-3.5" /> Required levels and manager ratings are read-only for employees.
        </p>
      </SectionCard>
    </AppShell>
  );
}