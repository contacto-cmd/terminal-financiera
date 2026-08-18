// Server-side helpers for the free CoinGecko public API (no API key required).
// Docs: https://www.coingecko.com/en/api/documentation

const BASE = "https://api.coingecko.com/api/v3"

// Coins tracked across the terminal. Bitcoin is the flagship asset.
export const TRACKED_COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "cardano",
  "dogecoin",
  "avalanche-2",
  "chainlink",
  "polkadot",
  "litecoin",
  "uniswap",
] as const

export type CoinId = (typeof TRACKED_COINS)[number]

export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h_in_currency: number | null
  price_change_percentage_7d_in_currency: number | null
  sparkline_in_7d: { price: number[] }
}

async function cgFetch<T>(path: string, revalidate = 30): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { accept: "application/json" },
    // Cache on the server so we don't hammer the free rate limit.
    next: { revalidate },
  })
  if (!res.ok) {
    throw new Error(`CoinGecko error ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

export function getMarkets(ids: readonly string[] = TRACKED_COINS) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    order: "market_cap_desc",
    price_change_percentage: "1h,24h,7d",
    sparkline: "true",
  })
  return cgFetch<MarketCoin[]>(`/coins/markets?${params.toString()}`, 30)
}

export interface MarketChart {
  prices: [number, number][]
  total_volumes: [number, number][]
}

export interface GlobalStats {
  totalMarketCapUsd: number
  totalVolumeUsd: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
}

interface GlobalResponse {
  data: {
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
  }
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const json = await cgFetch<GlobalResponse>("/global", 120)
  return {
    totalMarketCapUsd: json.data.total_market_cap.usd,
    totalVolumeUsd: json.data.total_volume.usd,
    btcDominance: json.data.market_cap_percentage.btc,
    ethDominance: json.data.market_cap_percentage.eth,
    marketCapChange24h: json.data.market_cap_change_percentage_24h_usd,
  }
}

export interface FearGreed {
  value: number
  label: string
}

/** Crypto Fear & Greed Index from alternative.me (free, no API key). */
export async function getFearGreed(): Promise<FearGreed | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      headers: { accept: "application/json" },
      next: { revalidate: 600 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { value: string; value_classification: string }[]
    }
    const entry = json.data?.[0]
    if (!entry) return null
    const map: Record<string, string> = {
      "Extreme Fear": "Miedo extremo",
      Fear: "Miedo",
      Neutral: "Neutral",
      Greed: "Codicia",
      "Extreme Greed": "Codicia extrema",
    }
    return {
      value: Number(entry.value),
      label: map[entry.value_classification] ?? entry.value_classification,
    }
  } catch {
    return null
  }
}

export function getMarketChart(id: string, days: number) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: String(days),
  })
  return cgFetch<MarketChart>(`/coins/${id}/market_chart?${params.toString()}`, 60)
}
