import { subDays, subHours, subMinutes } from 'date-fns'

export interface MetricData {
  metric: {
    container: string
    cpu: string
    endpoint: string
    id: string
    image: string
    instance: string
    job: string
    metrics_path: string
    name: string
    namespace: string
    node: string
    pod: string
    prometheus: string
    service: string
  }
  values: [number, string][]
}

export const COLORS = [
  'var(--color-purple-500)',
  '#D940FF',
  '#009EDD',
  '#F4C004',
  '#00FF66',
  '#FF5733',
  '#33CCCC',
  '#FF3399',
  '#FFCC00',
  '#66FF33',
  '#FF66CC',
  '#FF9900',
  '#00FFFF',
  '#FF00FF',
  '#8B4513',
  '#1E90FF',
  '#32CD32',
  '#FF1493',
  '#00CED1',
]

export type TimeRangeOption =
  | 'live'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '3h'
  | '6h'
  | '12h'
  | '24h'
  | '2d'
  | '7d'
  | 'custom'

export const timeRangeOptions = [
  { label: '📊 Live tailing', value: 'live' },
  { label: 'Last 5 minutes', value: '5m' },
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last 30 minutes', value: '30m' },
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 3 hours', value: '3h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 12 hours', value: '12h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 2 days', value: '2d' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Custom range (UTC)', value: 'custom' },
]

export function createTimeRange(duration: string, endTime?: Date): { start: Date; end: Date } {
  const end = endTime || new Date()
  const start = new Date(end)

  switch (duration) {
    case 'last_15_minutes':
      start.setMinutes(start.getMinutes() - 15)
      break
    case 'last_30_minutes':
      start.setMinutes(start.getMinutes() - 30)
      break
    case 'last_1_hour':
      start.setHours(start.getHours() - 1)
      break
    case 'last_3_hours':
      start.setHours(start.getHours() - 3)
      break
    case 'last_6_hours':
      start.setHours(start.getHours() - 6)
      break
    case 'last_12_hours':
      start.setHours(start.getHours() - 12)
      break
    case 'last_24_hours':
      start.setDate(start.getDate() - 1)
      break
    case 'last_7_days':
      start.setDate(start.getDate() - 7)
      break
    default:
      // Default to last hour
      start.setHours(start.getHours() - 1)
  }

  return { start, end }
}

export const createTimeRangeHandler = (
  setTimeRange: (value: TimeRangeOption) => void,
  setStartDate: (date: string) => void,
  setEndDate: (date: string) => void
) => {
  return (value: TimeRangeOption) => {
    setTimeRange(value)
    const now = new Date()

    if (value === 'custom') {
      return
    }

    switch (value) {
      case 'live':
        setStartDate(subMinutes(now, 5).toISOString())
        setEndDate(now.toISOString())
        break
      case '5m':
        setStartDate(subMinutes(now, 5).toISOString())
        setEndDate(now.toISOString())
        break
      case '15m':
        setStartDate(subMinutes(now, 15).toISOString())
        setEndDate(now.toISOString())
        break
      case '30m':
        setStartDate(subMinutes(now, 30).toISOString())
        setEndDate(now.toISOString())
        break
      case '1h':
        setStartDate(subHours(now, 1).toISOString())
        setEndDate(now.toISOString())
        break
      case '3h':
        setStartDate(subHours(now, 3).toISOString())
        setEndDate(now.toISOString())
        break
      case '6h':
        setStartDate(subHours(now, 6).toISOString())
        setEndDate(now.toISOString())
        break
      case '12h':
        setStartDate(subHours(now, 12).toISOString())
        setEndDate(now.toISOString())
        break
      case '24h':
        setStartDate(subDays(now, 1).toISOString())
        setEndDate(now.toISOString())
        break
      case '2d':
        setStartDate(subDays(now, 2).toISOString())
        setEndDate(now.toISOString())
        break
      case '7d':
        setStartDate(subDays(now, 7).toISOString())
        setEndDate(now.toISOString())
        break
      default:
        break
    }
  }
}

/**
 * Generic helper to format timestamps for chart data
 */
export function formatTimestamp(timestampMs: number, useLocalTime: boolean) {
  const date = new Date(timestampMs)

  const timeString = useLocalTime
    ? date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      })

  const fullTimeString = useLocalTime
    ? date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }) + ' UTC'

  return { timeString, fullTimeString }
}

/**
 * Calculate appropriate interval based on time range duration
 */
function calculateInterval(startMs: number, endMs: number, existingDataInterval?: number): number {
  const durationMs = endMs - startMs
  const durationHours = durationMs / (1000 * 60 * 60)

  // If we have existing data, use its interval as a base, but cap it
  if (existingDataInterval) {
    // For long ranges, don't use intervals shorter than certain thresholds
    if (durationHours >= 24) {
      // For 24h+, minimum interval of 15 minutes
      return Math.max(existingDataInterval, 15 * 60 * 1000)
    } else if (durationHours >= 6) {
      // For 6-24h, minimum interval of 5 minutes
      return Math.max(existingDataInterval, 5 * 60 * 1000)
    } else if (durationHours >= 1) {
      // For 1-6h, minimum interval of 1 minute
      return Math.max(existingDataInterval, 60 * 1000)
    }
    return existingDataInterval
  }

  // Default intervals based on time range duration
  if (durationHours >= 168) {
    // 7 days
    return 4 * 60 * 60 * 1000 // 4 hours
  } else if (durationHours >= 48) {
    // 2 days
    return 2 * 60 * 60 * 1000 // 2 hours
  } else if (durationHours >= 24) {
    // 1 day
    return 60 * 60 * 1000 // 1 hour
  } else if (durationHours >= 6) {
    // 6 hours
    return 15 * 60 * 1000 // 15 minutes
  } else if (durationHours >= 3) {
    // 3 hours
    return 10 * 60 * 1000 // 10 minutes
  } else if (durationHours >= 1) {
    // 1 hour
    return 5 * 60 * 1000 // 5 minutes
  } else {
    return 60 * 1000 // 1 minute
  }
}

export function addTimeRangePadding<T extends { timestamp: number; time: string; fullTime: string }>(
  chartData: T[],
  startTimestamp: string,
  endTimestamp: string,
  useLocalTime: boolean
): T[] {
  if (!chartData.length) return []

  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000

  const allTimestamps = chartData.map((d) => d.timestamp).sort((a, b) => a - b)
  const firstDataMs = allTimestamps[0]
  const lastDataMs = allTimestamps[allTimestamps.length - 1]

  const existingData = new Set(chartData.map((d) => d.timestamp))
  const result = [...chartData]

  // Get all series keys from existing data (excluding base properties)
  const seriesKeys = new Set<string>()
  chartData.forEach((dataPoint) => {
    Object.keys(dataPoint).forEach((key) => {
      if (key !== 'timestamp' && key !== 'time' && key !== 'fullTime') {
        seriesKeys.add(key)
      }
    })
  })

  // Calculate existing data interval more accurately
  let existingDataInterval: number | undefined
  if (allTimestamps.length > 1) {
    // Use the most common interval between consecutive points
    const intervals: number[] = []
    for (let i = 1; i < allTimestamps.length; i++) {
      intervals.push(allTimestamps[i] - allTimestamps[i - 1])
    }
    // Use median interval to avoid outliers
    intervals.sort((a, b) => a - b)
    existingDataInterval = intervals[Math.floor(intervals.length / 2)]
  }

  const dataInterval = calculateInterval(startMs, endMs, existingDataInterval)

  // Helper function to create padding point with null values for all series
  const createPaddingPoint = (timestamp: number): T => {
    const { timeString, fullTimeString } = formatTimestamp(timestamp, useLocalTime)
    const point: any = {
      timestamp,
      time: timeString,
      fullTime: fullTimeString,
    }

    // Add null values for all existing series to hide lines during gaps
    seriesKeys.forEach((key) => {
      point[key] = null
    })

    return point as T
  }

  let paddingPointsAdded = 0

  // Add padding points before first data point
  let current = startMs
  while (current < firstDataMs) {
    if (!existingData.has(current)) {
      result.push(createPaddingPoint(current))
      paddingPointsAdded++
    }
    current += dataInterval
  }

  // Add padding points BETWEEN existing data points when there are large gaps
  for (let i = 0; i < allTimestamps.length - 1; i++) {
    const currentTimestamp = allTimestamps[i]
    const nextTimestamp = allTimestamps[i + 1]
    const gap = nextTimestamp - currentTimestamp

    // If gap is much larger than our target interval, fill it
    if (gap > dataInterval * 2) {
      let fillTimestamp = currentTimestamp + dataInterval
      while (fillTimestamp < nextTimestamp) {
        if (!existingData.has(fillTimestamp)) {
          result.push(createPaddingPoint(fillTimestamp))
          paddingPointsAdded++
        }
        fillTimestamp += dataInterval
      }
    }
  }

  // Add padding points after last data point
  current = lastDataMs + dataInterval
  while (current <= endMs) {
    if (!existingData.has(current)) {
      result.push(createPaddingPoint(current))
      paddingPointsAdded++
    }
    current += dataInterval
  }

  return result.sort((a, b) => a.timestamp - b.timestamp)
}
