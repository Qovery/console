import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseTerraformResourcesProps {
  terraformId: string
  enabled?: boolean
}

export function useTerraformResources({ terraformId, enabled = true }: UseTerraformResourcesProps) {
  return useQuery({
    ...queries.serviceTerraform.listResources(terraformId),
    enabled: Boolean(terraformId) && enabled,
  })
}
