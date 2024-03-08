import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentRuleProps {
  environmentId: string
}

export function useDeploymentRule({ environmentId }: UseDeploymentRuleProps) {
  return useQuery({
    ...queries.environments.deploymentRule({ environmentId }),
  })
}

export default useDeploymentRule
