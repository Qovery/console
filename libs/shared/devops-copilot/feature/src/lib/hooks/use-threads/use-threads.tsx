import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface Thread {
  id: string
  title: string
  created_at: string
  updated_at: string
  organization_id: string
}

interface UseThreadsReturn {
  threads: Thread[]
  isLoading: boolean
  error: string | null
  refetchThreads: () => Promise<void>
}

export const useThreads = ({ organizationId, owner }: { organizationId: string; owner: string }): UseThreadsReturn => {
  const {
    data: threads = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...queries.devopsCopilot.threads({ userId: owner, organizationId }),
    enabled: !!organizationId && !!owner,
  })

  return {
    threads,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetchThreads: async () => {
      await refetch()
    },
  }
}
