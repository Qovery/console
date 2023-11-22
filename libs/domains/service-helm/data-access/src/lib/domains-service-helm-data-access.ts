import { createQueryKeys } from '@lukemorales/query-key-factory'
import { HelmRepositoriesApi } from 'qovery-typescript-axios'

const helmRepositoriesApi = new HelmRepositoriesApi()

export const serviceHelm = createQueryKeys('serviceHelm', {
  listHelmRepository: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await helmRepositoriesApi.listHelmRepository(organizationId)
      return response.data.results
    },
  }),
})
