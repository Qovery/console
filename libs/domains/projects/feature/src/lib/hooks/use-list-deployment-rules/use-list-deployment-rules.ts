import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDeploymentRulesProps {
  projectId: string
  suspense?: boolean
}

export function useListDeploymentRules({ projectId, suspense = false }: UseListDeploymentRulesProps) {
  return useQuery({
    ...queries.projects.listDeploymentRules({ projectId }),
    suspense,
  })
}

export default useListDeploymentRules
