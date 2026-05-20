// Formatadores BR
export function fmtBRL(v: number | null | undefined, dec = 2): string {
  if (v == null || !isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

export function fmtBRLk(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1e9).toFixed(2).replace(".", ",")}B`;
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1e6).toFixed(2).replace(".", ",")}M`;
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1e3).toFixed(0)}k`;
  return `${sign}R$ ${abs.toFixed(0)}`;
}

export function fmtNum(v: number | null | undefined, dec = 0): string {
  if (v == null || !isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

export function fmtPct(v: number | null | undefined, dec = 1): string {
  if (v == null || !isFinite(v)) return "—";
  return `${(v * 100).toFixed(dec).replace(".", ",")}%`;
}

export function fmtDateBR(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("pt-BR");
}

export function cls(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}
