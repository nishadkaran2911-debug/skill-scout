import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/gap-ui";
import { useStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill Master — Skill Gap Analysis System" },
      { name: "description", content: "Central skill master with categories, definitions and active status." },
      { property: "og:title", content: "Skill Master" },
      { property: "og:description", content: "Maintain the organisation's skill taxonomy." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { db, update } = useStore();
  const categories = ["Technical", "Soft Skill", "Management", "Domain"] as const;

  return (
    <AppShell title="Skill Master" subtitle={`${db.skills.length} skills across four categories`} allow={["admin"]}>
      <div className="grid gap-5 xl:grid-cols-2">
        {categories.map((cat) => (
          <SectionCard key={cat} title={cat}>
            <ul className="space-y-2">
              {db.skills
                .filter((s) => s.category === cat)
                .map((s) => (
                  <li key={s._id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                    <Switch
                      checked={s.active}
                      onCheckedChange={(v) =>
                        update((cur) => ({
                          ...cur,
                          skills: cur.skills.map((x) => (x._id === s._id ? { ...x, active: v } : x)),
                        }))
                      }
                    />
                  </li>
                ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}