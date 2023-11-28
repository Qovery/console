import { createQueryKeys } from '@lukemorales/query-key-factory'
import { HelmRepositoriesApi, type HelmRequest, HelmsApi } from 'qovery-typescript-axios'

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
})

export const mutations = {
  async createHelm({ environmentId, helmRequest }: { environmentId: string; helmRequest: HelmRequest }) {
    const response = await helmsApi.createHelm(environmentId, helmRequest)
    return response.data
  },
  async createHelmDefaultValues({ environmentId }: { environmentId: string }) {
    const response = await helmsApi.createHelmDefaultValues(environmentId)
    return response.data
  },
}
