import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { GapStatus } from "@/lib/domain";

export const STATUS_STYLES: Record<GapStatus, string> = {
  RED: "bg-danger-soft text-danger border-danger/30",
  YELLOW: "bg-warning-soft text-warning-foreground border-warning/40",
  GREEN: "bg-success-soft text-success border-success/30",
};

export const STATUS_DOT: Record<GapStatus, string> = {
  RED: "bg-danger",
  YELLOW: "bg-warning",
  GREEN: "bg-success",
};

export const STATUS_TEXT: Record<GapStatus, string> = {
  RED: "Urgent Training",
  YELLOW: "Monitor",
  GREEN: "No Action",
};

export function StatusBadge({ status, label }: { status: GapStatus; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {label ?? STATUS_TEXT[status]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    danger: "bg-danger-soft text-danger",
    warning: "bg-warning-soft text-warning-foreground",
    success: "bg-success-soft text-success",
  }[tone];
  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && <span className={cn("flex size-8 items-center justify-center rounded-lg", toneClass)}>{icon}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface p-4 sm:p-5", className)}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function LevelBar({ required, actual }: { required: number; actual: number | null }) {
  return (
    <div className="min-w-24">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-soft">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/25"
          style={{ width: `${(required / 5) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${((actual ?? 0) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}