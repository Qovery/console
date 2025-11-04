import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useTerraformAvailableVersion() {
  return useQuery({
    ...queries.serviceTerraform.listAvailableVersions(),
  })
}

export default useTerraformAvailableVersion
