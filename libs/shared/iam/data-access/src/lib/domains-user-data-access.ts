import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type AccountInfo, AccountInfoApi } from 'qovery-typescript-axios'

const accountApi = new AccountInfoApi()

export const user = createQueryKeys('user', {
  account: {
    queryKey: null,
    async queryFn() {
      const result = await accountApi.getAccountInformation()
      return result.data
    },
  },
})

export const mutations = {
  async editAccount(accountInfo: AccountInfo) {
    const response = await accountApi.editAccountInformation(accountInfo)
    return response.data
  },
}
