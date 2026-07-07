// Pure functions to compute common technical indicators from a price series.

/** Simple Moving Average of the last `period` values. */
export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null
  const slice = values.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

/**
 * Relative Strength Index (Wilder's smoothing).
 * Returns a value between 0 and 100, or null if not enough data.
 */
export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null

  let gains = 0
  let losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1]
    const gain = diff >= 0 ? diff : 0
    const loss = diff < 0 ? -diff : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export interface IndicatorSnapshot {
  price: number
  sma20: number | null
  sma50: number | null
  rsi14: number | null
  trend: "alcista" | "bajista" | "lateral"
  signal: "sobrecompra" | "sobreventa" | "neutral"
}

export function computeIndicators(prices: number[]): IndicatorSnapshot {
  const price = prices[prices.length - 1] ?? 0
  const sma20 = sma(prices, 20)
  const sma50 = sma(prices, 50)
  const rsi14 = rsi(prices, 14)

  let trend: IndicatorSnapshot["trend"] = "lateral"
  if (sma20 != null && sma50 != null) {
    if (sma20 > sma50 * 1.005) trend = "alcista"
    else if (sma20 < sma50 * 0.995) trend = "bajista"
  }

  let signal: IndicatorSnapshot["signal"] = "neutral"
  if (rsi14 != null) {
    if (rsi14 >= 70) signal = "sobrecompra"
    else if (rsi14 <= 30) signal = "sobreventa"
  }

  return { price, sma20, sma50, rsi14, trend, signal }
}
