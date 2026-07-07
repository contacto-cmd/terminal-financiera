"use client"

import { Activity, Circle } from "lucide-react"
import { formatCompact } from "@/lib/format"
import type { MarketCoin } from "@/lib/coingecko"

interface HeaderProps {
  markets: MarketCoin[] | undefined
  updatedAt: number | undefined
  isLive: boolean
}

export function TerminalHeader({ markets, updatedAt, isLive }: HeaderProps) {
  const totalCap = markets?.reduce((sum, c) => sum + (c.market_cap ?? 0), 0)
  const btc = markets?.find((c) => c.id === "bitcoin")

  return (
    <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight tracking-tight">Satoshi Terminal</h1>
          <p className="font-mono text-[11px] text-muted-foreground">AGENTE DE MERCADO · 24/7</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs">
        {btc && (
          <div className="text-muted-foreground">
            BTC.D{" "}
            <span className="text-foreground">
              {totalCap ? ((btc.market_cap / totalCap) * 100).toFixed(1) : "-"}%
            </span>
          </div>
        )}
        <div className="text-muted-foreground">
          CAP TOTAL <span className="text-foreground">{totalCap ? formatCompact(totalCap) : "-"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle
            className={`h-2 w-2 ${isLive ? "fill-gain text-gain animate-pulse" : "fill-muted-foreground text-muted-foreground"}`}
            aria-hidden
          />
          <span className={isLive ? "text-gain" : "text-muted-foreground"}>
            {isLive ? "EN VIVO" : "CONECTANDO"}
          </span>
          {updatedAt && (
            <span className="text-muted-foreground">
              {new Date(updatedAt).toLocaleTimeString("es-ES")}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
