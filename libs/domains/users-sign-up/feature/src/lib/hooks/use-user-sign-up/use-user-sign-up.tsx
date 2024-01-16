import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useUserSignUp({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    ...queries.usersSignUp.get,
    enabled,
  })
}

export default useUserSignUp
