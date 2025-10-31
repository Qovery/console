import { type RdsMetricData } from '../hooks/use-rds-metrics/use-rds-metrics'
import { formatTimestamp } from './format-timestamp'

// Generic helper function to process metrics data
export function processMetricsData(
  metricsData: { data?: { result: RdsMetricData[] } } | undefined,
  timeSeriesMap: Map<
    number,
    { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
  >,
  getSeriesName: (series: RdsMetricData, index: number) => string,
  transformValue: (value: string) => number,
  useLocalTime: boolean
) {
  if (!metricsData?.data?.result) return

  metricsData.data.result.forEach((series: RdsMetricData, index: number) => {
    const seriesName = getSeriesName(series, index)

    series.values.forEach(([timestamp, value]: [number, string]) => {
      const timestampNum = timestamp * 1000 // Convert to milliseconds
      const { timeString, fullTimeString } = formatTimestamp(timestampNum, useLocalTime)

      if (!timeSeriesMap.has(timestampNum)) {
        timeSeriesMap.set(timestampNum, {
          timestamp: timestampNum,
          time: timeString,
          fullTime: fullTimeString,
        })
      }

      const dataPoint = timeSeriesMap.get(timestampNum)
      if (dataPoint) {
        const transformed = transformValue(value)
        dataPoint[seriesName] = isNaN(transformed) ? 0 : transformed
      }
    })
  })
}
