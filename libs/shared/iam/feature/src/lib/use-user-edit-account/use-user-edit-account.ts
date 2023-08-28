import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/shared/iam/data-access'

export const useEditUserAccount = () => {
  return useMutation(mutations.editAccount, {
    meta: {
      notifyOnSuccess: {
        title: 'User updated',
      },
      notifyOnError: true,
    },
  })
}
