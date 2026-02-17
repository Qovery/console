import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDeploymentStagesProps {
  environmentId: string
}

export function useListDeploymentStages({ environmentId }: UseListDeploymentStagesProps) {
  return useQuery({
    ...queries.environments.listDeploymentStages({ environmentId }),
  })
}

export default useListDeploymentStages
