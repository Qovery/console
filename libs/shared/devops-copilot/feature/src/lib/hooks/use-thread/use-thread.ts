import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useThread({
  userId, organizationId, threadId, token,
}: {
  userId: string
  organizationId: string
  threadId: string
  token: string
}, p0: { enabled: boolean }) {
  return useQuery({
    ...queries.devopsCopilot.thread({ userId, organizationId, threadId, token }),
    enabled: p0.enabled,
  })
}

export default useThread
