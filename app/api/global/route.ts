import { getFearGreed, getGlobalStats } from "@/lib/coingecko"

export async function GET() {
  try {
    const [stats, fearGreed] = await Promise.all([getGlobalStats(), getFearGreed()])
    return Response.json({ stats, fearGreed, updatedAt: Date.now() })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return Response.json({ error: message, updatedAt: Date.now() }, { status: 200 })
  }
}
