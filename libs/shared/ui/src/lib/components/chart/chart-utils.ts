export function getLogicalTicks(startTimestamp: number, endTimestamp: number, tickCount = 6): number[] {
  const startTime = startTimestamp * 1000
  const endTime = endTimestamp * 1000

  const ticks: number[] = []
  const interval = (endTime - startTime) / (tickCount - 1) // N-1 intervals for N ticks

  for (let i = 0; i < tickCount; i++) {
    ticks.push(startTime + interval * i)
  }

  return ticks
}

function getXAxisDomain(startTimestamp: number, endTimestamp: number): [number, number] {
  return [startTimestamp * 1000, endTimestamp * 1000]
}

export interface XAxisConfig {
  dataKey: string
  type: 'number'
  scale: 'time'
  domain: [number, number]
  ticks: number[]
  tick: { fontSize: number; fill: string }
  tickLine: { stroke: string }
  axisLine: { stroke: string }
  allowDataOverflow: boolean
  interval: 'preserveStartEnd'
}

export type TimeGranularity = 'seconds' | 'minutes' | 'days'

export function getTimeGranularity(startTime: number, endTime: number): TimeGranularity {
  const durationMs = Math.abs(endTime - startTime)
  const durationMinutes = durationMs / (1000 * 60)
  const durationHours = durationMinutes / 60

  // If duration is less than 10 minutes, show seconds
  if (durationMinutes < 10) {
    return 'seconds'
  }
  // If duration is less than 1 day, show minutes (HH:MM)
  else if (durationHours < 24) {
    return 'minutes'
  }
  // For 1+ days, show days (DD/MM HH:MM)
  else {
    return 'days'
  }
}

export function createXAxisConfig(
  startTimestamp: number,
  endTimestamp: number,
  options: {
    axisLineColor?: string
    tickColor?: string
    tickCount?: number
  } = {}
): Omit<XAxisConfig, 'tickFormatter'> {
  const { axisLineColor = 'var(--color-neutral-200)', tickColor = 'var(--color-neutral-350)', tickCount = 6 } = options

  return {
    dataKey: 'timestamp',
    type: 'number',
    scale: 'time',
    domain: getXAxisDomain(startTimestamp, endTimestamp),
    ticks: getLogicalTicks(startTimestamp, endTimestamp, tickCount),
    tick: { fontSize: 12, fill: tickColor },
    tickLine: { stroke: 'transparent' },
    axisLine: { stroke: axisLineColor },
    allowDataOverflow: true,
    interval: 'preserveStartEnd',
  }
}

export interface DecimationOptions {
  isZoomed?: boolean
  startTimestamp?: number
  endTimestamp?: number
}

export function decimateChartData<T extends Record<string, unknown>>(
  inputData: T[],
  options: DecimationOptions = {}
): T[] {
  // Early returns for performance - avoid any processing if possible
  if (!inputData.length) return inputData
  if (inputData.length <= 3) return inputData // Always preserve very small datasets

  const { isZoomed = false } = options

  // Highly aggressive decimation for multi-chart dashboards - prioritize performance over granularity
  const getMaxPoints = (dataLength: number, zoomed: boolean): number => {
    // Even more aggressive thresholds based on 208-point lag with 12 charts (2496 total points)
    // Target: max 50-100 points per chart = 600-1200 total points across all charts
    if (dataLength > 500) return zoomed ? 200 : 80 // 196 → 80 points for 24h range
    if (dataLength > 200) return zoomed ? 150 : 60 // Medium datasets
    if (dataLength > 100) return zoomed ? 100 : 50 // Small datasets
    return Math.min(dataLength, 40) // Very small datasets
  }

  const maxPoints = getMaxPoints(inputData.length, isZoomed)

  // Early return if no decimation needed - avoids array allocation
  if (inputData.length <= maxPoints) return inputData

  // Performance optimization: Pre-calculate step and use more efficient sampling
  const step = Math.max(1, Math.floor(inputData.length / maxPoints))

  // Optimized approach: Use step-based sampling with minimal array operations
  const decimated: T[] = []
  const lastIndex = inputData.length - 1

  // Always include first point
  decimated.push(inputData[0])

  // Sample points using calculated step, avoiding the last point
  for (let i = step; i < lastIndex; i += step) {
    decimated.push(inputData[i])
  }

  // Always include last point if it's different from first
  if (lastIndex > 0) {
    decimated.push(inputData[lastIndex])
  }

  return decimated
}
