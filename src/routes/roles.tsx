import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/gap-ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Job Roles — Skill Gap Analysis System" },
      { name: "description", content: "Job roles and the required proficiency level for every mapped skill." },
      { property: "og:title", content: "Job Role Management" },
      { property: "og:description", content: "Define required proficiency levels per role and skill." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  const { db, update } = useStore();
  const skillById = new Map(db.skills.map((s) => [s._id, s]));

  function setLevel(roleId: string, skillId: string, level: number) {
    update((cur) => ({
      ...cur,
      roles: cur.roles.map((r) =>
        r._id === roleId
          ? {
              ...r,
              requiredSkills: r.requiredSkills.map((rs) =>
                rs.skillId === skillId ? { ...rs, requiredLevel: level } : rs,
              ),
            }
          : r,
      ),
    }));
  }

  return (
    <AppShell title="Job Roles" subtitle="Required skills and proficiency levels" allow={["admin"]}>
      <div className="grid gap-5 xl:grid-cols-2">
        {db.roles.map((role) => (
          <SectionCard
            key={role._id}
            title={role.name}
            description={`${role.description} · ${db.departments.find((d) => d._id === role.departmentId)?.name}`}
          >
            <ul className="space-y-2">
              {role.requiredSkills.map((rs) => (
                <li key={rs.skillId} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                  <span className="text-sm font-medium">{skillById.get(rs.skillId)?.name}</span>
                  <span className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLevel(role._id, rs.skillId, l)}
                        className={
                          "size-7 rounded border text-xs font-semibold " +
                          (rs.requiredLevel === l
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-background")
                        }
                      >
                        {l}
                      </button>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}