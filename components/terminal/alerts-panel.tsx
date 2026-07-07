"use client"

import { useEffect, useState } from "react"
import { Bell, BellRing, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAlerts, type PriceAlert } from "@/lib/store"
import { formatPrice } from "@/lib/format"
import type { MarketCoin } from "@/lib/coingecko"

interface AlertsPanelProps {
  markets: MarketCoin[] | undefined
}

export function AlertsPanel({ markets }: AlertsPanelProps) {
  const [alerts, setAlerts, hydrated] = useAlerts()
  const [open, setOpen] = useState(false)
  const [coinId, setCoinId] = useState("bitcoin")
  const [direction, setDirection] = useState<"above" | "below">("above")
  const [target, setTarget] = useState("")

  const priceOf = (id: string) => markets?.find((m) => m.id === id)?.current_price ?? 0

  // Evalúa las alertas cada vez que cambian los precios de mercado.
  useEffect(() => {
    if (!markets?.length) return
    setAlerts((prev) => {
      let changed = false
      const next = prev.map((a) => {
        if (a.triggered) return a
        const price = priceOf(a.coinId)
        if (!price) return a
        const hit = a.direction === "above" ? price >= a.target : price <= a.target
        if (hit) {
          changed = true
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`Alerta ${a.symbol}`, {
              body: `${a.symbol} ${a.direction === "above" ? "≥" : "≤"} ${formatPrice(a.target)} (ahora ${formatPrice(price)})`,
            })
          }
          return { ...a, triggered: true }
        }
        return a
      })
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets])

  function addAlert(e: React.FormEvent) {
    e.preventDefault()
    const coin = markets?.find((m) => m.id === coinId)
    if (!coin || !target) return
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
    }
    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      coinId: coin.id,
      symbol: coin.symbol.toUpperCase(),
      direction,
      target: Number(target),
      createdAt: Date.now(),
      triggered: false,
    }
    setAlerts((prev) => [alert, ...prev])
    setTarget("")
    setOpen(false)
  }

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="Alertas de precio">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Alertas</h2>
        </div>
        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setOpen((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> Nueva
        </Button>
      </div>

      {open && (
        <form onSubmit={addAlert} className="grid gap-2 border-b border-border bg-secondary/30 p-3">
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
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "above" | "below")}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              aria-label="Dirección"
            >
              <option value="above">Sube a ≥</option>
              <option value="below">Baja a ≤</option>
            </select>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Precio objetivo"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
              required
            />
          </div>
          <Button type="submit" size="sm" className="h-8">
            Crear alerta
          </Button>
        </form>
      )}

      <ul className="divide-y divide-border">
        {hydrated && alerts.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-muted-foreground">
            Sin alertas. Crea una para vigilar un precio.
          </li>
        )}
        {alerts.map((a) => (
          <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
            {a.triggered ? (
              <BellRing className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <Bell className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {a.symbol}{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  {a.direction === "above" ? "≥" : "≤"} {formatPrice(a.target)}
                </span>
              </div>
              <div className={`font-mono text-xs ${a.triggered ? "text-gain" : "text-muted-foreground"}`}>
                {a.triggered ? "Activada" : "Vigilando…"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
              className="text-muted-foreground transition-colors hover:text-loss"
              aria-label={`Eliminar alerta ${a.symbol}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
