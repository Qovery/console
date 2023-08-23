import { createQueryKeys } from '@lukemorales/query-key-factory'
import { AccountInfoApi } from 'qovery-typescript-axios'

const accountApi = new AccountInfoApi()

export const user = createQueryKeys('user', {
  account: () => ({
    queryKey: ['account'],
    async queryFn() {
      const result = await accountApi.getAccountInformation()
      return result.data
    },
  }),
})
