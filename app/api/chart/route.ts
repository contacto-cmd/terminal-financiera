import { getMarketChart } from "@/lib/coingecko"
import { computeIndicators } from "@/lib/indicators"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id") ?? "bitcoin"
  const days = Number(searchParams.get("days") ?? "7")

  try {
    const chart = await getMarketChart(id, days)
    const prices = chart.prices.map(([, p]) => p)
    const timestamps = chart.prices.map(([t]) => t)
    const series = chart.prices.map(([t, p]) => ({ t, p }))
    const indicators = computeIndicators(prices, timestamps)
    return Response.json({ id, days, series, indicators, updatedAt: Date.now() })
  } catch (err) {
    console.log("[v0] chart route error:", (err as Error).message)
    return Response.json({ error: "No se pudo cargar el gráfico." }, { status: 502 })
  }
}
