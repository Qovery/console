import { useMutation } from '@tanstack/react-query'
import { type AccountInfo } from 'qovery-typescript-axios'
import { mutations } from '@qovery/shared/iam/data-access'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

export const useEditUserAccount = () => {
  return useMutation(
    async (accountInfo: AccountInfo) => {
      const data = await mutations.editAccount(accountInfo)
      return data
    },
    {
      onSuccess() {
        toast(ToastEnum.SUCCESS, 'User updated')
      },
      onError: (err) => {
        toastError(err as Error)
      },
    }
  )
}
