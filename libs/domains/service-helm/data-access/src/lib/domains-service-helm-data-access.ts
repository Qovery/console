import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type HelmDefaultValuesRequest, HelmRepositoriesApi, type HelmRequest, HelmsApi } from 'qovery-typescript-axios'

const helmRepositoriesApi = new HelmRepositoriesApi()
const helmsApi = new HelmsApi()

export const serviceHelm = createQueryKeys('serviceHelm', {
  listHelmRepository: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await helmRepositoriesApi.listHelmRepository(organizationId)
      return response.data.results
    },
  }),
  helmDefaultValues: ({
    environmentId,
    helmDefaultValuesRequest,
  }: {
    environmentId: string
    helmDefaultValuesRequest: HelmDefaultValuesRequest
  }) => ({
    queryKey: [environmentId],
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
