import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDeploymentStagesProps {
  environmentId: string
  suspense?: boolean
}

export function useListDeploymentStages({ environmentId, suspense }: UseListDeploymentStagesProps) {
  return useQuery({
    ...queries.environments.listDeploymentStages({ environmentId }),
    suspense,
  })
}

export default useListDeploymentStages
