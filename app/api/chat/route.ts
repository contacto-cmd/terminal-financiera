import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai"
import { z } from "zod"
import { getMarkets, getMarketChart, TRACKED_COINS } from "@/lib/coingecko"
import { computeIndicators } from "@/lib/indicators"
import { formatPrice, formatPercent, formatCompact } from "@/lib/format"

export const maxDuration = 30

const SYSTEM_PROMPT = `Eres "Satoshi", un analista de mercados cripto integrado en una terminal de trading.
Respondes SIEMPRE en español, de forma concisa y profesional.

Reglas:
- Usa las herramientas para obtener datos REALES en tiempo real antes de opinar sobre precios o tendencias.
- Explica el razonamiento con los indicadores (RSI, medias móviles SMA20/SMA50, tendencia).
- Cuando des un análisis, incluye una nota breve de que NO es asesoramiento financiero y que el usuario asume el riesgo.
- Si te preguntan algo fuera de finanzas/cripto, redirige amablemente al tema.
- Formatea cifras de forma legible. Usa viñetas cuando ayude.

Monedas disponibles (ids de CoinGecko): ${TRACKED_COINS.join(", ")}.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "anthropic/claude-haiku-4.5",
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(6),
    tools: {
      getMarketData: tool({
        description:
          "Obtiene precios y cambios porcentuales (1h, 24h, 7d) en vivo de las criptomonedas seguidas.",
        inputSchema: z.object({
          ids: z
            .array(z.string())
            .optional()
            .describe("Ids de CoinGecko (ej. bitcoin, ethereum). Vacío = todas."),
        }),
        execute: async ({ ids }) => {
          const list = ids && ids.length ? ids : [...TRACKED_COINS]
          const markets = await getMarkets(list)
          return markets.map((c) => ({
            name: c.name,
            symbol: c.symbol.toUpperCase(),
            price: formatPrice(c.current_price),
            change1h: formatPercent(c.price_change_percentage_1h_in_currency),
            change24h: formatPercent(c.price_change_percentage_24h_in_currency),
            change7d: formatPercent(c.price_change_percentage_7d_in_currency),
            marketCap: formatCompact(c.market_cap),
            volume24h: formatCompact(c.total_volume),
          }))
        },
      }),
      getTechnicalAnalysis: tool({
        description:
          "Calcula indicadores técnicos (RSI 14, SMA20, SMA50, tendencia, señal) para una moneda en un rango de días.",
        inputSchema: z.object({
          id: z.string().describe("Id de CoinGecko, ej. bitcoin"),
          days: z.number().min(1).max(90).default(30).describe("Días de histórico a analizar"),
        }),
        execute: async ({ id, days }) => {
          const chart = await getMarketChart(id, days)
          const prices = chart.prices.map(([, p]) => p)
          const ind = computeIndicators(prices)
          return {
            id,
            days,
            precioActual: formatPrice(ind.price),
            rsi14: ind.rsi14 != null ? ind.rsi14.toFixed(1) : "n/d",
            sma20: ind.sma20 != null ? formatPrice(ind.sma20) : "n/d",
            sma50: ind.sma50 != null ? formatPrice(ind.sma50) : "n/d",
            tendencia: ind.trend,
            señal: ind.signal,
          }
        },
      }),
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
