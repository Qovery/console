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

export function detectDataBreaks(
  data: Array<{ timestamp: number; [key: string]: any }>,
  maxGapMs = 5 * 60 * 1000
): Array<{ start: number; end: number; duration: number }> {
  if (data.length < 2) return []

  const breaks = []
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

  // Find gaps where there's a significant time jump between consecutive data points
  for (let i = 1; i < sortedData.length; i++) {
    const prevPoint = sortedData[i - 1]
    const currentPoint = sortedData[i]
    const gap = currentPoint.timestamp - prevPoint.timestamp

    // Only consider it a break if the gap is significant AND there's actually missing data
    if (gap > maxGapMs) {
      breaks.push({
        start: prevPoint.timestamp,
        end: currentPoint.timestamp,
        duration: gap,
      })
    }
  }

  return breaks
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return minutes > 0 ? `${minutes}m` : `${Math.floor(ms / 1000)}s`
}
