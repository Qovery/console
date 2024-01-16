import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useListTimezone() {
  return useQuery({
    ...queries.services.listTimezone,
  })
}

export default useListTimezone
