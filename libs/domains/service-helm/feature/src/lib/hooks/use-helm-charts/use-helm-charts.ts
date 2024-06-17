import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmChartsProps {
  organizationId: string
  environmentId: string
  chartName: string
  enabled?: boolean
}

export function useHelmCharts({ organizationId, environmentId, chartName, enabled }: UseHelmChartsProps) {
  return useQuery({
    ...queries.serviceHelm.helmCharts({
      organizationId,
      environmentId,
      chartName,
    }),
    select(data) {
      return data?.sort((a, b) => a.chart_name!.localeCompare(b.chart_name!))
    },
    enabled,
  })
}

export default useHelmCharts
