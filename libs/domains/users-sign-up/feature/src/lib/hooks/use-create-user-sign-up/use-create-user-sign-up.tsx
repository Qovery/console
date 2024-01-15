import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/users-sign-up/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateSignUp() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createUserSignup, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.usersSignUp.get.queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateSignUp
