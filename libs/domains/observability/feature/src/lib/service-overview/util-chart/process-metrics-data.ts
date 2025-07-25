import { type MetricData } from '../../hooks/use-metrics/use-metrics'
import { formatTimestamp } from '../util-chart/format-timestamp'

// Generic helper function to process metrics data
export function processMetricsData(
  metricsData: { data?: { result: MetricData[] } } | undefined,
  timeSeriesMap: Map<
    number,
    { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
  >,
  getSeriesName: (series: MetricData, index: number) => string,
  transformValue: (value: string) => number,
  useLocalTime: boolean
) {
  if (!metricsData?.data?.result) return

  metricsData.data.result.forEach((series: MetricData, index: number) => {
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

      const dataPoint = timeSeriesMap.get(timestampNum)!
      const transformed = transformValue(value)
      dataPoint[seriesName] = isNaN(transformed) ? 0 : transformed
    })
  })
}
