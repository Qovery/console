import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type HelmDefaultValuesRequest, type HelmRequest, HelmsApi } from 'qovery-typescript-axios'

const helmsApi = new HelmsApi()

export const serviceHelm = createQueryKeys('serviceHelm', {
  helmDefaultValues: ({
    environmentId,
    helmDefaultValuesRequest,
  }: {
    environmentId: string
    helmDefaultValuesRequest: HelmDefaultValuesRequest
  }) => ({
    queryKey: [environmentId, helmDefaultValuesRequest],
    async queryFn() {
      const response = await helmsApi.createHelmDefaultValues(environmentId, helmDefaultValuesRequest)
      return response.data
    },
  }),
})

export const mutations = {
  async createHelmService({ environmentId, helmRequest }: { environmentId: string; helmRequest: HelmRequest }) {
    const response = await helmsApi.createHelm(environmentId, helmRequest)
    return response.data
  },
}
