import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDetailsDeploymentRuleProps {
  projectId: string
  deploymentRuleId: string
}

export function useDetailsDeploymentRule({ projectId, deploymentRuleId }: UseDetailsDeploymentRuleProps) {
  return useQuery({
    ...queries.projects.detailsDeploymentRule({ projectId, deploymentRuleId }),
  })
}

export default useDetailsDeploymentRule
