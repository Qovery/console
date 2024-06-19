import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmChartsProps {
  organizationId: string
  helmRepositoryId: string
  chartName?: string
  enabled?: boolean
}

export function useHelmCharts({ organizationId, helmRepositoryId, chartName, enabled }: UseHelmChartsProps) {
  return useQuery({
    ...queries.serviceHelm.helmCharts({
      organizationId,
      helmRepositoryId,
      chartName,
    }),
    select(data) {
      return data?.sort((a, b) => a.chart_name!.localeCompare(b.chart_name!))
    },
    enabled,
  })
}

export default useHelmCharts
