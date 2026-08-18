"use client"

import { useChart } from "@/lib/hooks"
import { formatNumber, formatPrice } from "@/lib/format"

interface IndicatorPanelProps {
  coinId: string
  days: number
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" | "primary" }) {
  const toneClass =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : tone === "primary" ? "text-primary" : ""
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-sm ${toneClass}`}>{value}</div>
    </div>
  )
}

export function IndicatorPanel({ coinId, days }: IndicatorPanelProps) {
  const { data } = useChart(coinId, days)
  const ind = data?.indicators

  const rsi = ind?.rsi14 ?? null
  const rsiTone = rsi == null ? undefined : rsi >= 70 ? "loss" : rsi <= 30 ? "gain" : "primary"
  const trendTone = ind?.trend === "alcista" ? "gain" : ind?.trend === "bajista" ? "loss" : "primary"
  const signalTone = ind?.signal === "sobrecompra" ? "loss" : ind?.signal === "sobreventa" ? "gain" : "primary"

  const hist = ind?.macd?.histogram ?? null
  const macdTone = hist == null ? undefined : hist > 0 ? "gain" : hist < 0 ? "loss" : "primary"

  const pctB = ind?.bollinger?.percentB ?? null
  const bandLabel =
    pctB == null ? "—" : pctB >= 0.95 ? "banda alta" : pctB <= 0.05 ? "banda baja" : "dentro del rango"
  const bandTone = pctB == null ? "" : pctB >= 0.95 ? "text-loss" : pctB <= 0.05 ? "text-gain" : "text-primary"

  return (
    <section className="rounded-lg border border-border bg-card p-4" aria-label="Indicadores técnicos">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Análisis técnico
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">{days}D</span>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">RSI (14)</span>
          <span className={rsiTone === "gain" ? "text-gain" : rsiTone === "loss" ? "text-loss" : "text-primary"}>
            {rsi != null ? rsi.toFixed(1) : "—"}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(Math.max(rsi ?? 0, 0), 100)}%` }}
          />
          <div className="absolute inset-y-0 left-[30%] w-px bg-gain/50" />
          <div className="absolute inset-y-0 left-[70%] w-px bg-loss/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="SMA 20" value={ind?.sma20 != null ? formatPrice(ind.sma20) : "—"} />
        <Stat label="SMA 50" value={ind?.sma50 != null ? formatPrice(ind.sma50) : "—"} />
        <Stat label="Tendencia" value={ind?.trend ?? "—"} tone={trendTone} />
        <Stat label="Señal" value={ind?.signal ?? "—"} tone={signalTone} />
        <Stat
          label="MACD hist."
          value={ind?.macd ? formatNumber(ind.macd.histogram, 2) : "—"}
          tone={macdTone}
        />
        <Stat
          label="Volatilidad"
          value={ind?.volatility != null ? `${ind.volatility.toFixed(1)}% anual` : "—"}
        />
      </div>

      {ind?.bollinger && (
        <div className="mt-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Bandas de Bollinger</span>
            <span className={bandTone}>{bandLabel}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 w-1 rounded-full bg-primary transition-all"
              style={{ left: `${Math.min(Math.max(ind.bollinger.percentB * 100, 0), 98)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>{formatPrice(ind.bollinger.lower)}</span>
            <span>{formatPrice(ind.bollinger.upper)}</span>
          </div>
        </div>
      )}
    </section>
  )
}
