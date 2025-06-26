import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Customized } from 'recharts'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import ReferenceLineEvents from '../reference-line-events/reference-line-events'
import { Chart, ChartTooltip, ChartTooltipContent, Line, ReferenceLine } from './chart'
import { useObservabilityContext } from './observability-context'
import { COLORS, type MetricData, addTimeRangePadding, formatTimestamp } from './time-range-utils'

export function CpuChart({ events }: { events?: OrganizationEventResponse[] }) {
  const { organizationId = '' } = useParams()
  const { clusterId, serviceId, customQuery, customApiEndpoint, startTimestamp, endTimestamp, useLocalTime } =
    useObservabilityContext()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    type: 'cpu',
    organizationId,
    clusterId,
    serviceId,
    customQuery: `sum by (pod, label_qovery_com_service_id) (rate(container_cpu_usage_seconds_total{container!="", pod=~".+"}[1m]) * on(namespace, pod) group_left() kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    customApiEndpoint,
    startDate: startTimestamp,
    endDate: endTimestamp,
  })

  const { data: limitMetrics, isLoading: isLoadingLimit } = useMetrics({
    type: 'cpu',
    organizationId,
    clusterId,
    serviceId,
    customQuery: `sum by (label_qovery_com_service_id) (bottomk(1,kube_pod_container_resource_limits{resource="cpu", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
    customApiEndpoint,
    startDate: startTimestamp,
    endDate: endTimestamp,
  })

  const { data: requestMetrics, isLoading: isLoadingRequest } = useMetrics({
    type: 'cpu',
    organizationId,
    clusterId,
    serviceId,
    customQuery: `sum by (label_qovery_com_service_id) (bottomk(1,kube_pod_container_resource_requests{resource="cpu", container!="", pod=~".+"}* on(namespace, pod) group_left(label_qovery_com_service_id)kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
    customApiEndpoint,
    startDate: startTimestamp,
    endDate: endTimestamp,
  })

  // const legendItems = useMemo((): LegendItem[] => {
  //   const items: LegendItem[] = []

  //   seriesNames.forEach((name, index) => {
  //     const color = COLORS[index] ?? 'var(--color-brand-500)'
  //     const label = originalPodNames[name] || name
  //     items.push({
  //       name,
  //       color,
  //       visible: visibleSeries.size === 0 || visibleSeries.has(name),
  //       label: `Pod: ${label}`,
  //     })
  //   })

  //   limitSeriesNames.forEach((name) => {
  //     items.push({
  //       name,
  //       color: 'var(--color-red-500)',
  //       visible: visibleSeries.size === 0 || visibleSeries.has(name),
  //       label: 'CPU Limit',
  //     })
  //   })

  //   // Ajouter les requêtes CPU
  //   requestSeriesNames.forEach((name) => {
  //     items.push({
  //       name,
  //       color: 'var(--color-brand-500)',
  //       visible: visibleSeries.size === 0 || visibleSeries.has(name),
  //       label: 'CPU Request',
  //     })
  //   })

  //   return items
  // }, [seriesNames, limitSeriesNames, requestSeriesNames, originalPodNames, visibleSeries])

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<number, { timestamp: number; time: string; fullTime: string; [key: string]: any }>()

    // Process regular CPU metrics
    metrics.data.result.forEach((series: MetricData, index: number) => {
      const seriesName = `pod-${index + 1}`

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
        const cpuValue = parseFloat(value) * 1000 // Convert to mCPU
        dataPoint[seriesName] = cpuValue
      })
    })

    // Process CPU limit metrics
    if (limitMetrics?.data?.result) {
      limitMetrics.data.result.forEach((series: MetricData) => {
        const seriesName = 'cpu-limit'

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
          const limitValue = parseFloat(value) * 1000 // Convert to mCPU
          dataPoint[seriesName] = limitValue
        })
      })
    }

    // Process CPU request metrics
    if (requestMetrics?.data?.result) {
      requestMetrics.data.result.forEach((series: MetricData) => {
        const seriesName = 'cpu-request'

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
          const requestValue = parseFloat(value) * 1000 // Convert to mCPU
          dataPoint[seriesName] = requestValue
        })
      })
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, limitMetrics, requestMetrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) => `pod-${index + 1}`)
  }, [metrics])

  const limitSeriesNames = useMemo(() => {
    if (!limitMetrics?.data?.result) return []
    return limitMetrics.data.result.map(() => 'cpu-limit')
  }, [limitMetrics])

  const requestSeriesNames = useMemo(() => {
    if (!requestMetrics?.data?.result) return []
    return requestMetrics.data.result.map(() => 'cpu-request')
  }, [requestMetrics])

  const originalPodNames = useMemo(() => {
    if (!metrics?.data?.result) return {}
    const mapping: Record<string, string> = {}
    metrics.data.result.forEach((series: MetricData, index: number) => {
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
      colors={COLORS}
      isLoading={isLoadingMetrics || isLoadingLimit || isLoadingRequest}
      useLocalTime={useLocalTime}
      timeRange={{
        start: startTimestamp,
        end: endTimestamp,
      }}
    >
      <ChartTooltip
        content={(props) => (
          <ChartTooltipContent
            {...props}
            title="CPU Usage"
            formatLabel={(seriesKey) => {
              if (seriesKey.startsWith('pod-')) {
                return originalPodNames[seriesKey] || seriesKey
              } else if (seriesKey === 'cpu-limit') {
                return 'CPU Limit'
              } else if (seriesKey === 'cpu-request') {
                return 'CPU Request'
              }
              return seriesKey
            }}
            formatValue={(value) => {
              const numValue = parseFloat(value?.toString() || '0')
              return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)} mCPU`
            }}
          />
        )}
      />
      {limitSeriesNames.map((name: string) => {
        return (
          <Line
            key={name}
            type="linear"
            dataKey={name}
            stroke="var(--color-red-500)"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 2, stroke: 'var(--color-red-500)', color: 'var(--color-red-500)' }}
            connectNulls={false}
            isAnimationActive={false}
          />
        )
      })}
      {requestSeriesNames.map((name: string) => {
        return (
          <Line
            key={name}
            type="linear"
            dataKey={name}
            stroke="var(--color-brand-500)"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 2, stroke: 'var(--color-brand-500)', color: 'var(--color-brand-500)' }}
            connectNulls={false}
            isAnimationActive={false}
          />
        )
      })}

      <Customized component={ReferenceLineEvents} events={events} />
    </Chart>
  )
}

export default CpuChart
