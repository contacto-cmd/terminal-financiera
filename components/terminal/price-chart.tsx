"use client"

import { useMemo } from "react"
import { Area, AreaChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useChart } from "@/lib/hooks"
import { formatPrice, formatPercent } from "@/lib/format"
import type { MarketCoin } from "@/lib/coingecko"

const TIMEFRAMES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
]

function rollingSma(values: number[], period: number) {
  const out: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) out.push(null)
    else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += values[j]
      out.push(sum / period)
    }
  }
  return out
}

interface PriceChartProps {
  coin: MarketCoin | undefined
  days: number
  onDaysChange: (d: number) => void
}

export function PriceChart({ coin, days, onDaysChange }: PriceChartProps) {
  const { data, isLoading } = useChart(coin?.id ?? "bitcoin", days)

  const chartData = useMemo(() => {
    if (!data?.series) return []
    const prices = data.series.map((s) => s.p)
    const sma20 = rollingSma(prices, 20)
    return data.series.map((s, i) => ({ t: s.t, price: s.p, sma20: sma20[i] }))
  }, [data])

  const change = coin?.price_change_percentage_24h_in_currency ?? 0
  const positive = change >= 0

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="Gráfico de precio">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold">
            {coin ? `${coin.name} · ${coin.symbol.toUpperCase()}` : "—"}
          </h2>
          <span className="font-mono text-lg">{coin ? formatPrice(coin.current_price) : "—"}</span>
          <span className={`font-mono text-sm ${positive ? "text-gain" : "text-loss"}`}>
            {formatPercent(change)}
          </span>
        </div>
        <div className="flex gap-1" role="group" aria-label="Rango temporal">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.days}
              type="button"
              onClick={() => onDaysChange(tf.days)}
              aria-pressed={days === tf.days}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                days === tf.days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full p-2">
        {isLoading && !chartData.length ? (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            Cargando datos…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={(t) =>
                  days <= 1
                    ? new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                    : new Date(t).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
                }
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatPrice(v)}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(t) => new Date(t as number).toLocaleString("es-ES")}
                formatter={(value, name) => [formatPrice(Number(value)), name === "sma20" ? "SMA20" : "Precio"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#priceFill)"
              />
              <Line type="monotone" dataKey="sma20" stroke="var(--chart-4)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
