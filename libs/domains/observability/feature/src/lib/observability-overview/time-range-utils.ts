import { subDays, subHours, subMinutes } from 'date-fns'

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
