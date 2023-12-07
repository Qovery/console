import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterAdvancedSettingsProps {
  organizationId: string
  clusterId: string
}

export function useClusterAdvancedSettings({ organizationId, clusterId }: UseClusterAdvancedSettingsProps) {
  return useQuery({
    ...queries.clusters.advancedSettings({ organizationId, clusterId }),
  })
}

export default useClusterAdvancedSettings
