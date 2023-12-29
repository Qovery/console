import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentRuleProps {
  projectId: string
  deploymentRuleId: string
}

export function useDeploymentRule({ projectId, deploymentRuleId }: UseDeploymentRuleProps) {
  return useQuery({
    ...queries.projects.detailsDeploymentRule({ projectId, deploymentRuleId }),
  })
}

export default useDeploymentRule
