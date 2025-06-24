import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import { Chart } from './chart'
import { useObservabilityContext } from './observability-context'
import { COLORS, addTimeRangePadding } from './time-range-utils'

export function CpuChart() {
  const { organizationId = '' } = useParams()
  const { clusterId, serviceId, customQuery, customApiEndpoint, startTimestamp, endTimestamp, useLocalTime } =
    useObservabilityContext()

  const { data: metrics, isLoading } = useMetrics({
    type: 'cpu',
    organizationId,
    clusterId,
    serviceId,
    customQuery,
    customApiEndpoint,
    startDate: startTimestamp,
    endDate: endTimestamp,
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<number, { timestamp: number; time: string; fullTime: string; [key: string]: any }>()

    metrics.data.result.forEach((series: any, index: number) => {
      const seriesName = `pod-${index + 1}`

      series.values.forEach(([timestamp, value]: [number, string]) => {
        const timestampNum = timestamp * 1000 // Convert to milliseconds
        const date = new Date(timestampNum)

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

        if (!timeSeriesMap.has(timestampNum)) {
          timeSeriesMap.set(timestampNum, {
            timestamp: timestampNum,
            time: timeString,
            fullTime: fullTimeString,
          })
        }

        const dataPoint = timeSeriesMap.get(timestampNum)!
        const cpuValue = parseFloat(value) * 1000 // Convert to mCPU
        dataPoint[seriesName] = cpuValue
      })
    })

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: any, index: number) => `pod-${index + 1}`)
  }, [metrics])

  const originalPodNames = useMemo(() => {
    if (!metrics?.data?.result) return {}
    const mapping: Record<string, string> = {}
    metrics.data.result.forEach((series: any, index: number) => {
      const podName = series.metric['pod'] || `Series ${index + 1}`
      mapping[`pod-${index + 1}`] = podName
    })
    return mapping
  }, [metrics])

  return (
    <Chart
      label="CPU (mCPU)"
      chartData={chartData}
      seriesNames={seriesNames}
      originalPodNames={originalPodNames}
      colors={COLORS}
      isLoading={isLoading}
      useLocalTime={useLocalTime}
      timeRange={{
        start: startTimestamp,
        end: endTimestamp,
      }}
    />
  )
}

export default CpuChart
