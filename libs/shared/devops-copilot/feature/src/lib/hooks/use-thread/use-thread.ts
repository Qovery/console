import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useThread({
  userId,
  organizationId,
  threadId,
  enabled,
}: {
  userId: string
  organizationId: string
  threadId: string
  enabled?: boolean
}) {
  return useQuery({
    ...queries.devopsCopilot.thread({ userId, organizationId, threadId }),
    enabled,
  })
}

export default useThread
