import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cls } from "@/lib/fmt";

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Todos",
  maxBadges = 2,
  width = "min-w-[160px]",
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  maxBadges?: number;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return options;
    const qq = q.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(qq));
  }, [q, options]);

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={ref} className={cls("relative", width)}>
      <label className="block text-[10px] uppercase tracking-wide text-muted mb-1 font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cls(
          "w-full bg-bg-elev border rounded-md px-2.5 py-1.5 text-sm text-left flex items-center justify-between gap-2 transition-colors",
          open ? "border-accent" : "border-ink-DEFAULT hover:border-ink-DEFAULT/70",
          value.length === 0 && "text-muted"
        )}
      >
        <span className="truncate flex-1 flex items-center gap-1">
          {value.length === 0 ? (
            placeholder
          ) : value.length <= maxBadges ? (
            value.map((v) => (
              <span key={v} className="bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded">
                {v}
              </span>
            ))
          ) : (
            <span className="text-white">
              {value.length} <span className="text-muted">selecionados</span>
            </span>
          )}
        </span>
        {value.length > 0 && (
          <X className="w-3.5 h-3.5 text-muted hover:text-white" onClick={clear} />
        )}
        <ChevronDown className={cls("w-4 h-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-40 top-full left-0 mt-1 w-full min-w-[220px] bg-bg-card border border-ink-DEFAULT rounded-md shadow-2xl shadow-black/50">
          <div className="p-1.5 border-b border-ink-DEFAULT">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-bg-elev border border-ink-DEFAULT rounded px-2 py-1 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-muted">Sem resultados</div>}
            {filtered.slice(0, 200).map((o) => {
              const checked = value.includes(o);
              return (
                <button
                  key={o}
                  onClick={() => toggle(o)}
                  className={cls(
                    "w-full text-left px-2.5 py-1.5 text-sm flex items-center gap-2 hover:bg-bg-elev transition-colors",
                    checked && "text-accent"
                  )}
                >
                  <div className={cls("w-4 h-4 rounded border grid place-items-center", checked ? "bg-accent border-accent" : "border-ink-DEFAULT")}>
                    {checked && <Check className="w-3 h-3 text-bg" />}
                  </div>
                  <span className="truncate">{o}</span>
                </button>
              );
            })}
            {filtered.length > 200 && (
              <div className="px-3 py-1.5 text-[11px] text-muted">+{filtered.length - 200} ocultos (refine busca)</div>
            )}
          </div>
          {value.length > 0 && (
            <div className="p-1.5 border-t border-ink-DEFAULT flex justify-between items-center">
              <span className="text-[11px] text-muted">{value.length} selecionado(s)</span>
              <button onClick={() => onChange([])} className="text-[11px] text-muted hover:text-white">
                Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wide text-muted mb-1 font-medium">{label}</label>
      <div className="inline-flex bg-bg-elev border border-ink-DEFAULT rounded-md p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cls(
              "px-2.5 py-1 text-xs rounded transition-colors",
              value === o.value ? "bg-accent text-bg font-medium" : "text-muted hover:text-white"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
