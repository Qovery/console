import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export type UseCommitsProps = Parameters<typeof queries.services.listCommits>[0]

export function useCommits(props: UseCommitsProps) {
  return useQuery({
    ...queries.services.listCommits(props),
  })
}

export default useCommits
