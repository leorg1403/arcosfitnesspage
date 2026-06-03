import type { SeriesPoint } from "@/lib/db/analytics";

// Gráfica de área + línea (estilo Vercel Analytics). SVG puro (server component),
// azul sobre fondo oscuro, gridlines y ejes. Escala uniforme (w-full).

const W = 1000;
const H = 320;
const PAD = { top: 18, right: 20, bottom: 30, left: 44 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function niceCeil(n: number): number {
  if (n <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * pow >= n) return m * pow;
  }
  return 10 * pow;
}

function fmtDay(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(/\./g, "");
}

export function AnalyticsChart({ series }: { series: SeriesPoint[] }) {
  const n = series.length;
  const max = niceCeil(Math.max(1, ...series.map((s) => s.visitors)));

  const x = (i: number) => (n <= 1 ? PAD.left : PAD.left + (i / (n - 1)) * INNER_W);
  const y = (v: number) => PAD.top + INNER_H * (1 - v / max);
  const baseY = PAD.top + INNER_H;

  const pts = series.map((s, i) => `${x(i)},${y(s.visitors)}`);
  const linePath = pts.length ? `M ${pts.join(" L ")}` : "";
  const areaPath = pts.length
    ? `M ${x(0)},${baseY} L ${pts.join(" L ")} L ${x(n - 1)},${baseY} Z`
    : "";

  // Etiquetas del eje X: hasta ~8 marcas distribuidas.
  const maxTicks = 8;
  const step = n <= maxTicks ? 1 : Math.ceil(n / maxTicks);
  const xticks = series.map((s, i) => ({ i, iso: s.day })).filter((t) => t.i % step === 0 || t.i === n - 1);

  const gridVals = [0, max / 2, max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Visitantes por día">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4A572" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#C4A572" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines + etiquetas Y */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#F5F4F0"
            strokeOpacity="0.08"
          />
          <text
            x={PAD.left - 10}
            y={y(v) + 4}
            textAnchor="end"
            fontSize="13"
            fill="#F5F4F0"
            fillOpacity="0.4"
          >
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* Área + línea */}
      {areaPath && <path d={areaPath} fill="url(#areaFill)" />}
      {linePath && (
        <path d={linePath} fill="none" stroke="#C4A572" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}

      {/* Etiquetas X */}
      {xticks.map((t) => (
        <text
          key={t.i}
          x={x(t.i)}
          y={H - 8}
          textAnchor={t.i === 0 ? "start" : t.i === n - 1 ? "end" : "middle"}
          fontSize="13"
          fill="#F5F4F0"
          fillOpacity="0.4"
        >
          {fmtDay(t.iso)}
        </text>
      ))}
    </svg>
  );
}
