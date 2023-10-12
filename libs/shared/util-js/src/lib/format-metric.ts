export function formatMetric(metric: { current: number; unit: 'mCPU' | 'MiB' | 'GiB'; current_percent?: number }) {
  return `${metric.current} ${metric.unit}${metric.current_percent ? ` (${metric.current_percent}%)` : ''}`
}

export default formatMetric
