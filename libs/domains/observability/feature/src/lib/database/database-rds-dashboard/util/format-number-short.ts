/**
 * Formats a number in short format (k, M, B)
 * Examples:
 * - 338483 → 338.5k
 * - 1500000 → 1.5M
 * - 2000000000 → 2B
 */
export function formatNumberShort(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    // Billions
    return `${(value / 1_000_000_000).toFixed(1)}B`
  } else if (absValue >= 1_000_000) {
    // Millions
    return `${(value / 1_000_000).toFixed(1)}M`
  } else if (absValue >= 1_000) {
    // Thousands
    return `${(value / 1_000).toFixed(1)}k`
  }

  // Less than 1000
  return value.toString()
}
