"use client"

import { useState } from "react"
import { Plus, Trash2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHoldings, type Holding } from "@/lib/store"
import { formatPrice, formatPercent, formatCompact } from "@/lib/format"
import type { MarketCoin } from "@/lib/coingecko"

interface PortfolioPanelProps {
  markets: MarketCoin[] | undefined
}

export function PortfolioPanel({ markets }: PortfolioPanelProps) {
  const [holdings, setHoldings, hydrated] = useHoldings()
  const [open, setOpen] = useState(false)
  const [coinId, setCoinId] = useState("bitcoin")
  const [amount, setAmount] = useState("")
  const [buyPrice, setBuyPrice] = useState("")

  const priceOf = (id: string) => markets?.find((m) => m.id === id)?.current_price ?? 0

  const totalValue = holdings.reduce((sum, h) => sum + h.amount * priceOf(h.id), 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.amount * h.buyPrice, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  function addHolding(e: React.FormEvent) {
    e.preventDefault()
    const coin = markets?.find((m) => m.id === coinId)
    if (!coin || !amount) return
    const h: Holding = {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      amount: Number(amount),
      buyPrice: buyPrice ? Number(buyPrice) : coin.current_price,
    }
    setHoldings((prev) => [...prev, h])
    setAmount("")
    setBuyPrice("")
    setOpen(false)
  }

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="Cartera">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Mi cartera</h2>
        </div>
        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setOpen((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> Añadir
        </Button>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="font-mono text-2xl">{formatCompact(totalValue)}</div>
        <div className={`font-mono text-sm ${totalPnl >= 0 ? "text-gain" : "text-loss"}`}>
          {totalPnl >= 0 ? "+" : ""}
          {formatCompact(totalPnl)} ({formatPercent(totalPnlPct)})
        </div>
      </div>

      {open && (
        <form onSubmit={addHolding} className="grid gap-2 border-b border-border bg-secondary/30 p-3">
          <select
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            aria-label="Moneda"
          >
            {(markets ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.symbol.toUpperCase()})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Cantidad"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
              required
            />
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Precio compra"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="h-8">
            Añadir posición
          </Button>
        </form>
      )}

      <ul className="divide-y divide-border">
        {hydrated && holdings.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-muted-foreground">
            Sin posiciones. Añade una para seguir tus ganancias.
          </li>
        )}
        {holdings.map((h, i) => {
          const value = h.amount * priceOf(h.id)
          const cost = h.amount * h.buyPrice
          const pnlPct = cost > 0 ? ((value - cost) / cost) * 100 : 0
          return (
            <li key={`${h.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{h.symbol}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {h.amount} @ {formatPrice(h.buyPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{formatPrice(value)}</div>
                <div className={`font-mono text-xs ${pnlPct >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatPercent(pnlPct)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHoldings((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-muted-foreground transition-colors hover:text-loss"
                aria-label={`Eliminar ${h.symbol}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
