import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmChartsVersionsProps {
  organizationId: string
  helmRepositoryId?: string
  chartName?: string
  enabled?: boolean
}

export function useHelmChartsVersions({ organizationId, helmRepositoryId, chartName }: UseHelmChartsVersionsProps) {
  return useQuery({
    ...queries.serviceHelm.helmCharts({
      organizationId,
      helmRepositoryId: helmRepositoryId!,
      chartName,
    }),
    select(data) {
      return data?.sort((a, b) => a.chart_name!.localeCompare(b.chart_name!))
    },
    enabled: !!helmRepositoryId && !!chartName,
  })
}

export default useHelmChartsVersions
