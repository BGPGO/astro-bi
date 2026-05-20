import { ReactNode } from "react";
import { cls } from "@/lib/fmt";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cls("bg-bg-card border border-ink-DEFAULT rounded-xl", className)}>
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cls("mb-6", className)}>
      {(title || right) && (
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-3">
            {title && <h3 className="text-[15px] font-semibold text-white">{title}</h3>}
            {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
