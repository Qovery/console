import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type SignUpRequest, UserSignUpApi } from 'qovery-typescript-axios'

const usersSignUpApi = new UserSignUpApi()

export const usersSignUp = createQueryKeys('usersSignUp', {
  get: {
    queryKey: null,
    async queryFn() {
      const result = await usersSignUpApi.getUserSignUp()
      return result.data
    },
  },
})

export const mutations = {
  async createUserSignup(payload: SignUpRequest) {
    const response = await usersSignUpApi.createUserSignUp(payload)
    // API doesn't return the data updated
    return response.data
  },
}
