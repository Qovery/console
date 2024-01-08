import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseInstallationHelmValuesProps {
  organizationId: string
  clusterId: string
}

export function useInstallationHelmValues({ organizationId, clusterId }: UseInstallationHelmValuesProps) {
  return useQuery({
    ...queries.clusters.installationHelmValues({ organizationId, clusterId }),
  })
}

export default useInstallationHelmValues
