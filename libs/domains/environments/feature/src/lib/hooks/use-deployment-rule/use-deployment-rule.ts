import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentRuleProps {
  environmentId: string
  enabled?: boolean
}

export function useDeploymentRule({ environmentId, enabled }: UseDeploymentRuleProps) {
  return useQuery({
    ...queries.environments.deploymentRule({ environmentId }),
    enabled,
  })
}

export default useDeploymentRule
