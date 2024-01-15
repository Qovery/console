import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useUserSignUp() {
  return useQuery({
    ...queries.usersSignUp.get,
  })
}

export default useUserSignUp
