"use client"

import { useState } from "react"
import { useMarkets } from "@/lib/hooks"
import { TerminalHeader } from "./header"
import { MarketPulse } from "./market-pulse"
import { Watchlist } from "./watchlist"
import { PriceChart } from "./price-chart"
import { IndicatorPanel } from "./indicator-panel"
import { PortfolioPanel } from "./portfolio-panel"
import { AlertsPanel } from "./alerts-panel"
import { AiAssistant } from "./ai-assistant"

export function Terminal() {
  const { data, isLoading } = useMarkets()
  const markets = data?.markets
  const [selectedId, setSelectedId] = useState("bitcoin")
  const [days, setDays] = useState(7)

  const selectedCoin = markets?.find((m) => m.id === selectedId)
  const isLive = !isLoading && !data?.error && !!markets?.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TerminalHeader markets={markets} updatedAt={data?.updatedAt} isLive={isLive} />

      {data?.error && (
        <div className="border-b border-loss/30 bg-loss/10 px-6 py-2 text-center font-mono text-xs text-loss">
          {data.error} Reintentando automáticamente…
        </div>
      )}

      <div className="px-4 pt-4 lg:px-6">
        <MarketPulse />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12 lg:gap-4 lg:p-6">
        {/* Columna izquierda: watchlist */}
        <aside className="rounded-lg border border-border bg-card lg:col-span-3">
          <Watchlist markets={markets} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        {/* Columna central: gráfico + indicadores + cartera/alertas */}
        <main className="flex flex-col gap-4 lg:col-span-6">
          <PriceChart coin={selectedCoin} days={days} onDaysChange={setDays} />
          <IndicatorPanel coinId={selectedId} days={days} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PortfolioPanel markets={markets} />
            <AlertsPanel markets={markets} />
          </div>
        </main>

        {/* Columna derecha: agente de IA */}
        <aside className="lg:col-span-3">
          <AiAssistant />
        </aside>
      </div>
    </div>
  )
}
