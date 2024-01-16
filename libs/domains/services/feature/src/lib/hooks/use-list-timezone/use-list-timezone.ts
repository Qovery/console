import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useListTimezone() {
  return useQuery({
    ...queries.services.listTimezone,
    meta: {
      notifyOnError: true,
    },
  })
}

export default useListTimezone
