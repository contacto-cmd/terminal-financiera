"use client"

import Image from "next/image"
import { formatPrice, formatPercent } from "@/lib/format"
import type { MarketCoin } from "@/lib/coingecko"

interface WatchlistProps {
  markets: MarketCoin[] | undefined
  selectedId: string
  onSelect: (id: string) => void
}

function Spark({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices?.length) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 64
  const h = 24
  const step = w / (prices.length - 1)
  const d = prices
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(" ")
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <path d={d} fill="none" stroke={positive ? "var(--gain)" : "var(--loss)"} strokeWidth={1.5} />
    </svg>
  )
}

export function Watchlist({ markets, selectedId, onSelect }: WatchlistProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Watchlist</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{markets?.length ?? 0} activos</span>
      </div>
      <ul className="flex-1 divide-y divide-border overflow-y-auto">
        {(markets ?? []).map((c) => {
          const change = c.price_change_percentage_24h_in_currency ?? 0
          const positive = change >= 0
          const selected = c.id === selectedId
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent ${
                  selected ? "bg-accent" : ""
                }`}
              >
                <Image
                  src={c.image || "/placeholder.svg"}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{c.symbol.toUpperCase()}</span>
                    {selected && <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{c.name}</span>
                </div>
                <Spark prices={c.sparkline_in_7d?.price ?? []} positive={positive} />
                <div className="w-24 text-right">
                  <div className="font-mono text-sm">{formatPrice(c.current_price)}</div>
                  <div className={`font-mono text-xs ${positive ? "text-gain" : "text-loss"}`}>
                    {formatPercent(change)}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
