import { z } from 'zod'

const timeRangeEnum = z.enum(['5m', '15m', '30m', '1h', '3h', '6h', '12h', '24h', '2d', '7d', '30d', 'custom'])

const booleanSearchParamSchema = z.preprocess((value) => {
  if (value === '1' || value === 'true' || value === 1 || value === true) return true
  if (value === '0' || value === 'false' || value === 0 || value === false) return false
  return undefined
}, z.boolean())

export const monitoringDashboardSearchParamsSchema = z.object({
  timeRange: timeRangeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  useLocalTime: booleanSearchParamSchema.optional(),
  hideEvents: booleanSearchParamSchema.optional(),
  expandCharts: booleanSearchParamSchema.optional(),
  isLiveUpdateEnabled: booleanSearchParamSchema.optional(),
})

export type MonitoringDashboardSearchParams = z.infer<typeof monitoringDashboardSearchParamsSchema>
