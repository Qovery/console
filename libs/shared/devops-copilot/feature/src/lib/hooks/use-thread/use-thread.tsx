import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDeploymentRulesProps {
  projectId: string
}

export function useThread({
  userId,
  organizationId,
  threadId,
}: {
  userId: string
  organizationId: string
  threadId: string
}) {
  return useQuery({
    ...queries.devopsCopilot.thread({ userId, organizationId, threadId }),
  })
}

export default useThread
