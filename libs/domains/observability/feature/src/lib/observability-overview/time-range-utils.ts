import { subDays, subHours, subMinutes } from 'date-fns'

export const COLORS = [
  'var(--color-brand-500)',
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

// Utility function to create time ranges
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
      // Keep current dates for custom range
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

// Fonction utilitaire générique pour ajouter un padding aux données de graphiques
export function addTimeRangePadding<T extends { timestamp: number; time: string; fullTime: string }>(
  chartData: T[],
  startTimestamp: string,
  endTimestamp: string,
  useLocalTime: boolean
): T[] {
  if (!chartData.length) return chartData

  const timeSeriesMap = new Map<number, T>()

  // Ajouter toutes les données existantes
  chartData.forEach((dataPoint) => {
    timeSeriesMap.set(dataPoint.timestamp, dataPoint)
  })

  // Fonction helper pour formater les dates
  const formatTimestamp = (timestampMs: number) => {
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

  // Ajouter un point au début de la plage si absent
  const startTimestampMs = Number(startTimestamp) * 1000
  if (!timeSeriesMap.has(startTimestampMs)) {
    const { timeString, fullTimeString } = formatTimestamp(startTimestampMs)
    timeSeriesMap.set(startTimestampMs, {
      timestamp: startTimestampMs,
      time: timeString,
      fullTime: fullTimeString,
    } as T)
  }

  // Ajouter un point à la fin de la plage si absent
  const endTimestampMs = Number(endTimestamp) * 1000
  if (!timeSeriesMap.has(endTimestampMs)) {
    const { timeString, fullTimeString } = formatTimestamp(endTimestampMs)
    timeSeriesMap.set(endTimestampMs, {
      timestamp: endTimestampMs,
      time: timeString,
      fullTime: fullTimeString,
    } as T)
  }

  return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
}

// export const chartTimeData: ChartTimeData = {
//   '1h': {
//     type: '1m',
//     expectedInterval: 60_000,
//     label: () => t`1 hour`,
//     // ticks: 12,
//     format: (timestamp: string) => hourWithMinutes(timestamp),
//     getOffset: (endTime: Date) => timeHour.offset(endTime, -1),
//   },
//   '12h': {
//     type: '10m',
//     expectedInterval: 60_000 * 10,
//     label: () => t`12 hours`,
//     ticks: 12,
//     format: (timestamp: string) => hourWithMinutes(timestamp),
//     getOffset: (endTime: Date) => timeHour.offset(endTime, -12),
//   },
//   '24h': {
//     type: '20m',
//     expectedInterval: 60_000 * 20,
//     label: () => t`24 hours`,
//     format: (timestamp: string) => hourWithMinutes(timestamp),
//     getOffset: (endTime: Date) => timeHour.offset(endTime, -24),
//   },
//   '1w': {
//     type: '120m',
//     expectedInterval: 60_000 * 120,
//     label: () => t`1 week`,
//     ticks: 7,
//     format: (timestamp: string) => formatDay(timestamp),
//     getOffset: (endTime: Date) => timeDay.offset(endTime, -7),
//   },
//   '30d': {
//     type: '480m',
//     expectedInterval: 60_000 * 480,
//     label: () => t`30 days`,
//     ticks: 30,
//     format: (timestamp: string) => formatDay(timestamp),
//     getOffset: (endTime: Date) => timeDay.offset(endTime, -30),
//   },
// }
