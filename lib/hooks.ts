"use client"

import useSWR from "swr"
import type { FearGreed, GlobalStats, MarketCoin } from "@/lib/coingecko"
import type { IndicatorSnapshot } from "@/lib/indicators"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface MarketsResponse {
  markets: MarketCoin[]
  updatedAt: number
  error?: string
}

export function useMarkets() {
  return useSWR<MarketsResponse>("/api/markets", fetcher, {
    refreshInterval: 30_000, // polling cada 30s = "tiempo real"
    keepPreviousData: true,
  })
}

export interface GlobalResponse {
  stats?: GlobalStats
  fearGreed?: FearGreed | null
  updatedAt: number
  error?: string
}

export function useGlobal() {
  return useSWR<GlobalResponse>("/api/global", fetcher, {
    refreshInterval: 120_000,
    keepPreviousData: true,
  })
}

export interface ChartResponse {
  id: string
  days: number
  series: { t: number; p: number }[]
  indicators: IndicatorSnapshot
  updatedAt: number
  error?: string
}

export function useChart(id: string, days: number) {
  return useSWR<ChartResponse>(`/api/chart?id=${id}&days=${days}`, fetcher, {
    refreshInterval: 60_000,
    keepPreviousData: true,
  })
}
