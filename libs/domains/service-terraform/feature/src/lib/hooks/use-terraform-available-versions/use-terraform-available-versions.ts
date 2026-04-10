import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useTerraformAvailableVersions() {
  return useQuery({
    ...queries.serviceTerraform.listAvailableVersions(),
  })
}
