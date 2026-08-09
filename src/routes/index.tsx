import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gauge, Loader2, LockKeyhole, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Skill Gap Analysis System" },
      {
        name: "description",
        content:
          "Secure sign-in for HR, managers and employees to review skill gaps, assessments and training plans.",
      },
      { property: "og:title", content: "Sign in — Skill Gap Analysis System" },
      {
        property: "og:description",
        content: "Identifying employee skill gaps for organizational development.",
      },
    ],
  }),
  component: LoginPage,
});

const DEMO = [
  { label: "HR / Admin", email: "hr@nexoracorp.com", password: "Admin@123", icon: ShieldCheck },
  { label: "Manager", email: "ananya.sharma@nexoracorp.com", password: "Manager@123", icon: Users },
  { label: "Employee", email: "rohit.verma@nexoracorp.com", password: "Employee@123", icon: TrendingUp },
];

function LoginPage() {
  const { login, user, ready } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) void navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  function submit(nextEmail = email, nextPassword = password) {
    setError(null);
    if (!nextEmail.trim() || !nextPassword) {
      setError("Please enter both your email and password.");
      return;
    }
    setBusy(true);
    const res = login(nextEmail, nextPassword);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Unable to sign in.");
      return;
    }
    toast.success("Signed in successfully");
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Gauge className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">SkillGap</span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight">Skill Gap Analysis System</h2>
          <p className="mt-4 text-base text-primary-foreground/80">
            Identifying employee skill gaps for organizational development. Compare required proficiency
            against validated capability, and turn the difference into targeted training.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-4 text-sm">
            {[
              ["1–5", "Proficiency scale"],
              ["R/Y/G", "Criticality logic"],
              ["Live", "Gap analytics"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-primary-foreground/10 p-3">
                <dt className="font-display text-xl font-bold">{v}</dt>
                <dd className="text-primary-foreground/70">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-xs text-primary-foreground/60">Nexora Corp · Human Capital Analytics</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Gauge className="size-5" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">Skill Gap Analysis System</h1>
            <p className="text-sm text-muted-foreground">
              Identifying employee skill gaps for organizational development.
            </p>
          </div>

          <h2 className="font-display text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your corporate account to continue.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@nexoracorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo accounts
            </p>
            <div className="mt-3 space-y-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                    submit(d.email, d.password);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <d.icon className="size-4 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{d.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {d.email} · {d.password}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
