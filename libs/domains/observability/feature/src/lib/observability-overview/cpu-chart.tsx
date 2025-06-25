import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import { Chart, ChartTooltip, ChartTooltipContent, Label, Line, ReferenceLine } from './chart'
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
    customQuery,
    customApiEndpoint,
    startDate: startTimestamp,
    endDate: endTimestamp,
  })

  const { data: limitMetrics, isLoading: isLoadingLimit } = useMetrics({
    type: 'cpu',
    organizationId,
    clusterId,
    serviceId,
    customQuery: `sum by (label_qovery_com_service_id) (kube_pod_container_resource_limits{resource="cpu", container!="", pod=~".+"} * on(namespace, pod) group_left() kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
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

  const eventsDeployed = events?.filter((event) => event.event_type === 'DEPLOYED')

  const deploymentTimestamps = useMemo(() => {
    return (
      eventsDeployed
        ?.map((event) => {
          const timestamp = event.timestamp ? new Date(event.timestamp).getTime() : null
          return timestamp
        })
        .filter((timestamp): timestamp is number => timestamp !== null) || []
    )
  }, [eventsDeployed])

  return (
    <>
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

        {deploymentTimestamps.map((timestamp: number, index: number) => {
          const isInRange = timestamp >= Number(startTimestamp) * 1000 && timestamp <= Number(endTimestamp) * 1000
          if (!isInRange) return null

          const closestDataPoint = chartData.reduce((closest, current) => {
            const closestDiff = Math.abs(closest.timestamp - timestamp)
            const currentDiff = Math.abs(current.timestamp - timestamp)
            return currentDiff < closestDiff ? current : closest
          }, chartData[0])

          return (
            <ReferenceLine
              key={`deployment-${index}`}
              x={closestDataPoint?.timestamp || timestamp}
              stroke="var(--color-brand-500)"
              strokeWidth={2}
              strokeOpacity={0.5}
              strokeDasharray="3 3"
              label={{
                value: 'Deployed',
                position: 'top',
                offset: -2,
                style: { fontSize: 10, fill: 'var(--color-brand-500)', backgroundColor: 'var(--color-brand-500)' },
              }}
            />
          )
        })}
      </Chart>
      {/* <ChartLegend items={legendItems} onItemClick={onLegendClick} /> */}
    </>
  )
}

export default CpuChart
