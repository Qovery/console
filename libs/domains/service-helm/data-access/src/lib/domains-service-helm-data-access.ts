import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type HelmDefaultValuesRequest,
  HelmMainCallsApi,
  HelmRepositoriesApi,
  type HelmRequest,
  HelmsApi,
} from 'qovery-typescript-axios'

const helmsApi = new HelmsApi()
const helmMainCallsApi = new HelmMainCallsApi()
const helmRepositoriesApi = new HelmRepositoriesApi()

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
  helmCharts: ({
    organizationId,
    helmRepositoryId,
    chartName,
  }: {
    organizationId: string
    helmRepositoryId: string
    chartName?: string
  }) => ({
    queryKey: [organizationId, helmRepositoryId, chartName],
    async queryFn() {
      const response = await helmRepositoriesApi.getHelmCharts(organizationId, helmRepositoryId, chartName)
      return response.data.results
    },
  }),
  listKubernetesServices: ({ helmId }: { helmId: string }) => ({
    queryKey: [helmId],
    async queryFn() {
      const response = await helmMainCallsApi.getHelmKubernetesServices(helmId)
      return response.data.results
    },
  }),
})

export const mutations = {
  async createHelmService({ environmentId, helmRequest }: { environmentId: string; helmRequest: HelmRequest }) {
    const response = await helmsApi.createHelm(environmentId, helmRequest)
    return response.data
  },
}
