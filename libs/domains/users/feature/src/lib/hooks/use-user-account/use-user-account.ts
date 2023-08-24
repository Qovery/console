import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useUserAccount() {
  return useQuery({
    ...queries.user.account,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
  })
}

export default useUserAccount
