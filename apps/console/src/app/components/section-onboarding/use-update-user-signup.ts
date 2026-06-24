import { type SignUpRequest, UserSignUpApi } from 'qovery-typescript-axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

const usersSignUpApi = new UserSignUpApi()

export function useUpdateUserSignUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SignUpRequest) => usersSignUpApi.createUserSignUp(payload).then((r) => r.data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queries.usersSignUp.get.queryKey })
    },
  })
}
