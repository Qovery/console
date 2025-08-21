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

// Helper function to format timestamp for display
export function formatTimestampForDisplay(timestamp: number | string, useLocalTime: boolean): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp : parseInt(timestamp.toString()))

  if (useLocalTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const seconds = date.getUTCSeconds().toString().padStart(2, '0')
    return `${month} ${day}, ${year}, ${hours}:${minutes}:${seconds} UTC`
  }
}
