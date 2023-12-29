import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDeploymentRulesProps {
  projectId: string
}

export function useListDeploymentRules({ projectId }: UseListDeploymentRulesProps) {
  return useQuery({
    ...queries.projects.listDeploymentRules({ projectId }),
  })
}

export default useListDeploymentRules
