import { useCallback } from 'react'
import { Line } from 'recharts'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { useSimpleChartData } from '../util-chart/optimized-chart-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string) => `
  sum by(path,status)( rate(nginx_ingress_controller_requests{}[1m])
    * on(ingress) group_left(label_qovery_com_associated_service_id)
      max by(ingress, label_qovery_com_associated_service_id)(
        kube_ingress_labels{
          label_qovery_com_associated_service_id = "${serviceId}"
        }
      )
  )
`

export function NetworkRequestStatusChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: query(serviceId),
  })

  // Memoize transform and series name functions to prevent recreation
  const transformValue = useCallback((value: string) => parseFloat(value), [])
  const getSeriesName = useCallback((series: any, index: number) => 
    JSON.stringify(series.metric), []
  )

  // Use optimized chart data processing
  const { chartData, seriesNames } = useSimpleChartData({
    metrics,
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
  })

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Network request status (req/s)"
      description="Sudden drops or spikes may signal service instability"
      unit="req/s"
      serviceId={serviceId}
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          type="linear"
          stroke={getColorByPod(name)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
      ))}
    </LocalChart>
  )
}

export default NetworkRequestStatusChart
