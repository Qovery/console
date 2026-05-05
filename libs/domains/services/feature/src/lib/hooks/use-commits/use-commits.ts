import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export type UseCommitsProps = Parameters<typeof queries.services.listCommits>[0] & { enabled?: boolean }

export function useCommits(props: UseCommitsProps) {
  const { enabled = true, ...queryProps } = props
  return useQuery({
    ...queries.services.listCommits(queryProps),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes - commit history doesn't change frequently
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export default useCommits
