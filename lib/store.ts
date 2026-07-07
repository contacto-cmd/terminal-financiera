"use client"

import { useCallback, useEffect, useState } from "react"

// Lightweight client-side persistence for the personal portfolio and alerts.
// NOTE: this lives in the browser only. It can be upgraded to a real database
// (Amazon Aurora) for cross-device sync — ask v0 to wire it up.

export interface Holding {
  id: string // coingecko id
  symbol: string
  name: string
  amount: number
  buyPrice: number
}

export interface PriceAlert {
  id: string
  coinId: string
  symbol: string
  direction: "above" | "below"
  target: number
  createdAt: number
  triggered: boolean
}

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setState(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          /* ignore */
        }
        return value
      })
    },
    [key],
  )

  return [state, update, hydrated] as const
}

export function useHoldings() {
  return useLocalState<Holding[]>("st_holdings", [])
}

export function useAlerts() {
  return useLocalState<PriceAlert[]>("st_alerts", [])
}
