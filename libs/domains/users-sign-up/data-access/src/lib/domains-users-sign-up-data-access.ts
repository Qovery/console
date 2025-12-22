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

export type LocalSignUpPayload = SignUpRequest & {
  phone?: string
}

export const mutations = {
  async createUserSignup(payload: LocalSignUpPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone, ...payloadWithoutPhone } = payload
    const response = await usersSignUpApi.createUserSignUp(payloadWithoutPhone)
    // API doesn't return the data updated
    return response.data
  },
}
