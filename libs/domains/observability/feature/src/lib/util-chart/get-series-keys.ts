// Returns the series keys present in chart data, excluding the shared time fields.
// Useful as the `excludeKeys` argument to `addTimeRangePadding` when gaps in a
// series should be filled with 0 (e.g. a rate/percentile metric that is genuinely
// 0 when idle) rather than null (a visual break, meant for metrics where a gap
// signals a real monitoring outage).
export function getSeriesKeys<T extends { timestamp: number; time: string; fullTime: string }>(data: T[]): string[] {
  const keys = new Set<string>()

  data.forEach((point) => {
    Object.keys(point).forEach((key) => {
      if (key !== 'timestamp' && key !== 'time' && key !== 'fullTime') {
        keys.add(key)
      }
    })
  })

  return Array.from(keys)
}
