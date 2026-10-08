/** Formats a monthly amount for display. Always two decimals — budgets are exact. */
export function formatCost(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Formats a signed delta, so `+$7.60` reads differently from `-$7.60`. */
export function formatCostDelta(value: number, currency = 'USD'): string {
  const formatted = formatCost(Math.abs(value), currency)
  return value < 0 ? `−${formatted}` : `+${formatted}`
}
