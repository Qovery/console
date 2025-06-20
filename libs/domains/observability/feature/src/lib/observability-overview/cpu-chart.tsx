import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import { Chart } from './chart'
import { useObservabilityContext } from './observability-context'
import { COLORS } from './time-range-utils'

export function CpuChart() {
  const { organizationId = '' } = useParams()
  const {
    clusterId,
    serviceId,
    customQuery,
    customApiEndpoint,
    startTimestamp,
    endTimestamp,
    useLocalTime,
    startDate,
    endDate,
  } = useObservabilityContext()

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
    const timeRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    }

    // Create a complete timeline based on timeRange if provided
    if (timeRange) {
      const { start, end } = timeRange

      // For short durations, use the original approach but ensure full timeline coverage
      if (!metrics?.data?.result) {
        return []
      }

      const timeSeriesMap = new Map<number, { timestamp: number; time: string; fullTime: string; [key: string]: any }>()

      // First, add all actual data points
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

      // Then, ensure we have boundary points for the full time range
      const addBoundaryPoint = (boundaryTime: Date) => {
        const boundaryTimestamp = boundaryTime.getTime()
        if (!timeSeriesMap.has(boundaryTimestamp)) {
          const timeString = useLocalTime
            ? boundaryTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : boundaryTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              })

          const fullTimeString = useLocalTime
            ? boundaryTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : boundaryTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              }) + ' UTC'

          timeSeriesMap.set(boundaryTimestamp, {
            timestamp: boundaryTimestamp,
            time: timeString,
            fullTime: fullTimeString,
          })
        }
      }

      // Add start and end boundary points
      addBoundaryPoint(start)
      addBoundaryPoint(end)

      return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    }

    // Fallback to original logic if no timeRange provided
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

    return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [metrics, useLocalTime, startDate, endDate])

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
    />
  )
}

export default CpuChart
