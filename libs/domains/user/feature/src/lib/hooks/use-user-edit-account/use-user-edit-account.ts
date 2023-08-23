import { useMutation } from '@tanstack/react-query'
import { AccountInfo } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/user/data-access'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

export const useUserEditAccount = () => {
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
