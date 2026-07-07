export function formatPrice(value: number): string {
  if (value == null || Number.isNaN(value)) return "-"
  const digits = value >= 1 ? 2 : value >= 0.01 ? 4 : 6
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatCompact(value: number): string {
  if (value == null || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "-"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number, digits = 4): string {
  if (value == null || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value)
}
