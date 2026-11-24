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
    // Share the cache entry used by `useDeploymentHistory` and `getLatestEnvironmentDeploymentId`
    // so a freshly triggered execution (or an older one from the history list) can be found.
    ...queries.environments.deploymentHistoryV2({ environmentId, pageSize: 100 }),
    select: (data) => {
      return data?.find((history) => history.identifier.execution_id === executionId)
    },
    // A just-triggered execution may not be in the history yet: keep polling until it shows up.
    refetchInterval: (deploymentHistory) => (deploymentHistory ? false : 5000),
    enabled: !!executionId,
    suspense,
  })
}

export default useDeploymentHistoryExecutionId
