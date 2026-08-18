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

/** Exponential Moving Average series. */
export function emaSeries(values: number[], period: number): number[] {
  if (values.length === 0) return []
  const k = 2 / (period + 1)
  const out: number[] = [values[0]]
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] * k + out[i - 1] * (1 - k))
  }
  return out
}

export interface Macd {
  macd: number
  signal: number
  histogram: number
}

/** MACD (12, 26, 9) computed from a closing-price series. */
export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9): Macd | null {
  if (values.length < slow + signalPeriod) return null
  const fastEma = emaSeries(values, fast)
  const slowEma = emaSeries(values, slow)
  const macdLine = values.map((_, i) => fastEma[i] - slowEma[i])
  const signalLine = emaSeries(macdLine, signalPeriod)
  const last = macdLine.length - 1
  return {
    macd: macdLine[last],
    signal: signalLine[last],
    histogram: macdLine[last] - signalLine[last],
  }
}

export interface Bollinger {
  upper: number
  middle: number
  lower: number
  /** 0 = at lower band, 1 = at upper band. */
  percentB: number
}

/** Bollinger Bands (20, 2σ). */
export function bollinger(values: number[], period = 20, mult = 2): Bollinger | null {
  if (values.length < period) return null
  const slice = values.slice(-period)
  const middle = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((acc, v) => acc + (v - middle) ** 2, 0) / period
  const sd = Math.sqrt(variance)
  const upper = middle + mult * sd
  const lower = middle - mult * sd
  const price = values[values.length - 1]
  const range = upper - lower
  return {
    upper,
    middle,
    lower,
    percentB: range === 0 ? 0.5 : (price - lower) / range,
  }
}

/** Annualized volatility (%) from daily log returns. */
export function volatility(values: number[]): number | null {
  if (values.length < 3) return null
  const returns: number[] = []
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) returns.push(Math.log(values[i] / values[i - 1]))
  }
  if (returns.length < 2) return null
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(365) * 100
}

/** Maximum drawdown (%) over the series. */
export function maxDrawdown(values: number[]): number | null {
  if (values.length < 2) return null
  let peak = values[0]
  let worst = 0
  for (const v of values) {
    if (v > peak) peak = v
    const dd = (v - peak) / peak
    if (dd < worst) worst = dd
  }
  return worst * 100
}

export interface IndicatorSnapshot {
  price: number
  sma20: number | null
  sma50: number | null
  rsi14: number | null
  macd: Macd | null
  bollinger: Bollinger | null
  volatility: number | null
  maxDrawdown: number | null
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

  return {
    price,
    sma20,
    sma50,
    rsi14,
    macd: macd(prices),
    bollinger: bollinger(prices),
    volatility: volatility(prices),
    maxDrawdown: maxDrawdown(prices),
    trend,
    signal,
  }
}
