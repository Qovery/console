import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import { ContainerRegistriesApi } from 'qovery-typescript-axios'

const containerRegistriesApi = new ContainerRegistriesApi()

export const organizations = createQueryKeys('organizations', {
  containerRegistries: ({ organizationdId }) => ({
    queryKey: [organizationdId],
    async queryFn() {
      const response = await containerRegistriesApi.listContainerRegistry(organizationdId)
      return response.data.results
    },
  }),
  containerRegistry: ({ organizationdId, containerRegistryId }) => ({
    queryKey: [organizationdId, containerRegistryId],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerRegistry(organizationdId, containerRegistryId)
      return response.data
    },
  }),
})

export type OrganizationsKeys = inferQueryKeys<typeof organizations>
