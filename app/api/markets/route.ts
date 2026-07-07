import { getMarkets } from "@/lib/coingecko"

export async function GET() {
  try {
    const markets = await getMarkets()
    return Response.json({ markets, updatedAt: Date.now() })
  } catch (err) {
    console.log("[v0] markets route error:", (err as Error).message)
    return Response.json({ error: "No se pudieron cargar los datos de mercado." }, { status: 502 })
  }
}
