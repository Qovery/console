import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryExecutionIdProps {
  environmentId: string
  executionId?: string | null
  suspense?: boolean
}

export function useDeploymentHistoryExecutionId({
  environmentId,
  executionId,
  suspense = false,
}: UseDeploymentHistoryExecutionIdProps) {
  return useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId }),
    select: (data) => {
      return data?.find((history) => history.identifier.execution_id === executionId)
    },
    enabled: !!executionId,
    suspense,
  })
}

export default useDeploymentHistoryExecutionId
