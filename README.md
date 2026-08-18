# Terminal Financiera

Terminal de análisis de criptomonedas en tiempo real: precios en vivo, gráficos con
indicadores técnicos, seguimiento de cartera, alertas de precio y un agente de IA
para análisis de mercado.

## Módulos

- **Pulso global** — capitalización total, volumen 24h, dominancia BTC/ETH e índice de Miedo y Codicia
- **Watchlist** — 12 activos con precio en vivo, cambio 24h y sparkline
- **Gráfico técnico** — serie histórica con media móvil, rangos de 1 a 365 días
- **Indicadores** — RSI 14, SMA 20/50, MACD, Bandas de Bollinger, volatilidad anualizada
- **Cartera** — posiciones con P&L calculado sobre precios reales
- **Alertas** — avisos cuando el precio cruza un umbral
- **Agente IA (Satoshi)** — análisis en lenguaje natural con acceso a datos de mercado en vivo

## Fuentes de datos

Sin claves de API necesarias para los datos de mercado:

- [CoinGecko](https://www.coingecko.com/en/api) — precios, capitalización, histórico
- [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/) — índice de Miedo y Codicia

## Variables de entorno

| Variable | Requerida | Para qué sirve |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Solo para el agente de IA | Autentica con el Vercel AI Gateway. Sin ella, el resto de la terminal funciona igual. |

Consíguela en el dashboard de Vercel, sección **AI Gateway → API Keys**.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:3000`.

## Despliegue

### Opción A — Vercel

```bash
pnpm build
```

Conecta el repositorio en [vercel.com/new](https://vercel.com/new). Next.js se detecta
automáticamente; no hace falta configurar nada más.

### Opción B — Cloudflare Workers

El proyecto ya incluye el adaptador [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
`wrangler.jsonc` y `open-next.config.ts`.

Desde la línea de comandos:

```bash
pnpm cf:preview   # compila y prueba en local sobre el runtime de Workers
pnpm cf:deploy    # compila y publica en Cloudflare
```

Desde el panel de Cloudflare (**Workers & Pages → Create → Connect to Git**):

| Campo | Valor |
| --- | --- |
| Build command | `pnpm cf:build` |
| Deploy command | `npx wrangler deploy` |
| Output directory | `.open-next` |

Añade `AI_GATEWAY_API_KEY` en **Settings → Variables and Secrets** si quieres activar el agente de IA.

## Aviso

Herramienta de análisis y visualización de datos. No constituye asesoramiento
financiero ni recomendación de inversión.
