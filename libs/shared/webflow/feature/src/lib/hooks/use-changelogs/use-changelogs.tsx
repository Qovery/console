import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useChangelogs() {
  return useQuery({
    ...queries.webflow.changelogs,
    select: (data) => data ?? [],
  })
}

export default useChangelogs
