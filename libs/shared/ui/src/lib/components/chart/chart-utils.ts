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

  // Dynamic max points based on data size and zoom context
  const getMaxPoints = (dataLength: number, zoomed: boolean): number => {
    // More aggressive decimation for very large datasets
    if (dataLength > 50000) return zoomed ? 3000 : 1500
    if (dataLength > 20000) return zoomed ? 4000 : 2000
    if (dataLength > 10000) return zoomed ? 5000 : 2500
    if (dataLength > 5000) return zoomed ? 6000 : 3000
    return Math.min(dataLength, 4000) // No decimation for smaller datasets
  }

  const maxPoints = getMaxPoints(inputData.length, isZoomed)
  
  if (inputData.length <= maxPoints) return inputData

  const totalPoints = inputData.length
  const targetPoints = Math.min(maxPoints, totalPoints)
  const step = totalPoints / targetPoints
  
  // Always preserve first and last points for chart continuity
  const decimated = [inputData[0]]
  
  // Use floating point steps for more uniform distribution
  for (let i = step; i < totalPoints - 1; i += step) {
    const index = Math.round(i)
    if (index !== 0 && index !== totalPoints - 1 && index < totalPoints) {
      decimated.push(inputData[index])
    }
  }
  
  // Always include the last point if we have more than one point
  if (totalPoints > 1) {
    decimated.push(inputData[totalPoints - 1])
  }
  
  return decimated
}
