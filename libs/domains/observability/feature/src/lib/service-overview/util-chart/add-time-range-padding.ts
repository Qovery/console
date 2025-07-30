import { formatTimestamp } from './format-timestamp'

// Calculate appropriate interval based on time range duration
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
  useLocalTime: boolean,
  excludeKeys?: string[]
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

  // Helper function to create padding point with 0 values for all series except excluded ones
  const createPaddingPoint = (timestamp: number): T => {
    const { timeString, fullTimeString } = formatTimestamp(timestamp, useLocalTime)
    const point: {
      [key: string]: string | number | null
    } = {
      timestamp,
      time: timeString,
      fullTime: fullTimeString,
    }

    // Add values for all existing series
    seriesKeys.forEach((key) => {
      // For excluded keys (like scatter series), don't add any value
      // For other series, add null to hide lines during gaps
      if (!excludeKeys?.includes(key)) {
        point[key] = null
      } else {
        point[key] = 0
      }
    })

    return point as T
  }

  // Add padding points before first data point
  let current = startMs
  while (current < firstDataMs) {
    if (!existingData.has(current)) {
      result.push(createPaddingPoint(current))
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
    }
    current += dataInterval
  }

  return result.sort((a, b) => a.timestamp - b.timestamp)
}
