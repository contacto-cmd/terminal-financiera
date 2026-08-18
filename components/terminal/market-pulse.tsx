"use client"

import { useGlobal } from "@/lib/hooks"
import { formatCompact, formatPercent } from "@/lib/format"

function Cell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "gain" | "loss" | "primary"
}) {
  const toneClass =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : tone === "primary" ? "text-primary" : ""
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${toneClass}`}>{value}</span>
    </div>
  )
}

export function MarketPulse() {
  const { data } = useGlobal()
  const stats = data?.stats
  const fg = data?.fearGreed

  const change = stats?.marketCapChange24h ?? null
  const changeTone = change == null ? undefined : change >= 0 ? "gain" : "loss"

  const fgTone =
    fg == null ? undefined : fg.value >= 60 ? "gain" : fg.value <= 40 ? "loss" : "primary"

  return (
    <section
      className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-border bg-card px-4 py-3"
      aria-label="Pulso del mercado global"
    >
      <Cell
        label="Cap. total"
        value={stats ? formatCompact(stats.totalMarketCapUsd) : "—"}
      />
      <Cell label="Cap. 24h" value={formatPercent(change)} tone={changeTone} />
      <Cell label="Volumen 24h" value={stats ? formatCompact(stats.totalVolumeUsd) : "—"} />
      <Cell
        label="Dominancia BTC"
        value={stats ? `${stats.btcDominance.toFixed(1)}%` : "—"}
        tone="primary"
      />
      <Cell label="Dominancia ETH" value={stats ? `${stats.ethDominance.toFixed(1)}%` : "—"} />

      {fg && (
        <div className="flex min-w-40 flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Miedo y codicia
          </span>
          <span
            className={`font-mono text-sm ${
              fgTone === "gain" ? "text-gain" : fgTone === "loss" ? "text-loss" : "text-primary"
            }`}
          >
            {fg.value} · {fg.label}
          </span>
          <div
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="img"
            aria-label={`Índice de miedo y codicia: ${fg.value} de 100, ${fg.label}`}
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                fgTone === "gain" ? "bg-gain" : fgTone === "loss" ? "bg-loss" : "bg-primary"
              }`}
              style={{ width: `${Math.min(Math.max(fg.value, 0), 100)}%` }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
