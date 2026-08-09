import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileBarChart,
  Gauge,
  GraduationCap,
  Grid3x3,
  IdCard,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Target,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { UserRole } from "@/lib/domain";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Gauge;
  roles: UserRole[];
}

const NAV: Array<{ group: string; items: NavItem[] }> = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
      { to: "/skill-gaps", label: "Skill Gap Analysis", icon: Target, roles: ["admin", "manager", "employee"] },
      { to: "/heatmap", label: "Heatmap", icon: Grid3x3, roles: ["admin", "manager"] },
    ],
  },
  {
    group: "Assessments",
    items: [
      { to: "/assessment", label: "My Assessment", icon: ClipboardCheck, roles: ["employee", "manager"] },
      { to: "/reviews", label: "Review & Validate", icon: ListChecks, roles: ["admin", "manager"] },
    ],
  },
  {
    group: "Organisation",
    items: [
      { to: "/employees", label: "Employees", icon: Users, roles: ["admin", "manager"] },
      { to: "/departments", label: "Departments", icon: Building2, roles: ["admin"] },
      { to: "/roles", label: "Job Roles", icon: IdCard, roles: ["admin"] },
      { to: "/skills", label: "Skill Master", icon: BarChart3, roles: ["admin"] },
    ],
  },
  {
    group: "Development",
    items: [
      { to: "/training", label: "Training", icon: GraduationCap, roles: ["admin", "manager", "employee"] },
      { to: "/reports", label: "Reports", icon: FileBarChart, roles: ["admin", "manager"] },
    ],
  },
  {
    group: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: IdCard, roles: ["admin", "manager", "employee"] },
      { to: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "HR / Admin",
  manager: "Manager",
  employee: "Employee",
};

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  allow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  allow?: UserRole[];
}) {
  const { user, logout, ready } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) void navigate({ to: "/" });
  }, [ready, user, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const denied = allow && !allow.includes(user.role);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Link to="/dashboard" className="flex items-center gap-3 px-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gauge className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold">SkillGap</span>
          <span className="block text-[11px] text-muted-foreground">Analysis System</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-5">
        {NAV.map((group) => {
          const items = group.items.filter((i) => i.roles.includes(user.role));
          if (!items.length) return null;
          return (
            <div key={group.group}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground",
                        pathname === item.to && "bg-primary/10 text-primary",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="rounded-xl border border-border bg-secondary/60 p-3">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
            <button
              aria-label="Close navigation"
              className="absolute right-3 top-5 rounded-md p-1 text-muted-foreground hover:bg-secondary"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-card/85 px-4 py-4 backdrop-blur sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              aria-label="Open navigation"
              className="mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">
          {denied ? (
            <div className="card-surface mx-auto max-w-md p-8 text-center">
              <h2 className="text-lg font-semibold">Access restricted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your role ({ROLE_LABEL[user.role]}) does not have permission to view this page.
              </p>
              <Button className="mt-4" onClick={() => navigate({ to: "/dashboard" })}>
                Back to dashboard
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}