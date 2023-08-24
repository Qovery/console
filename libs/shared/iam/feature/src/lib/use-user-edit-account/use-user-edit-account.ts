import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/shared/iam/data-access'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

export const useEditUserAccount = () => {
  return useMutation(mutations.editAccount, {
    onSuccess() {
      toast(ToastEnum.SUCCESS, 'User updated')
    },
    onError: (err) => {
      toastError(err as Error)
    },
  })
}
