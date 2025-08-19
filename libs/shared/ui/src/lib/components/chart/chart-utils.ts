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
  if (!inputData.length) return inputData

  const { isZoomed = false } = options

  // Optimized max points thresholds - more aggressive decimation for better performance
  const getMaxPoints = (dataLength: number, zoomed: boolean): number => {
    // Reduced thresholds for better performance - abnormally low lag threshold fix
    if (dataLength > 10000) return zoomed ? 2000 : 800   // Reduced from 50k->1.5k to 10k->800
    if (dataLength > 5000) return zoomed ? 1500 : 600    // Reduced from 20k->2k to 5k->600
    if (dataLength > 2000) return zoomed ? 1000 : 400    // Reduced from 10k->2.5k to 2k->400
    if (dataLength > 1000) return zoomed ? 800 : 300     // Reduced from 5k->3k to 1k->300
    return Math.min(dataLength, 500) // Reduced from 4k to 500 for smaller datasets
  }

  const maxPoints = getMaxPoints(inputData.length, isZoomed)
  
  if (inputData.length <= maxPoints) return inputData

  const totalPoints = inputData.length
  const targetPoints = Math.min(maxPoints, totalPoints)
  
  // Performance optimization: Use integer steps for faster iteration
  const step = Math.max(1, Math.floor(totalPoints / targetPoints))
  
  // Always preserve first and last points for chart continuity
  const decimated = [inputData[0]]
  
  // Optimized sampling using integer steps
  for (let i = step; i < totalPoints - step; i += step) {
    decimated.push(inputData[i])
  }
  
  // Always include the last point if we have more than one point
  if (totalPoints > 1) {
    decimated.push(inputData[totalPoints - 1])
  }
  
  return decimated
}
