import { createQueryKeys } from '@lukemorales/query-key-factory'
import { TerraformMainCallsApi } from 'qovery-typescript-axios'
import { type TerraformResourcesResponse } from '@qovery/shared/interfaces'
import { mockTerraformResourcesResponse } from './mock-data'

const terraformApi = new TerraformMainCallsApi()

export const serviceTerraform = createQueryKeys('serviceTerraform', {
  listAvailableVersions: () => ({
    queryKey: ['listTerraformAvailableVersion'],
    async queryFn() {
      const response = await terraformApi.listTerraformVersions()
      return response.data.results
    },
  }),
  listResources: (terraformId: string) => ({
    queryKey: [terraformId, 'resources'],
    async queryFn(): Promise<TerraformResourcesResponse> {
      // TODO: Replace with actual API call once backend is ready
      // const response = await terraformApi.getTerraformResources(terraformId)
      // return response.data as TerraformResourcesResponse

      // For now, return mock data
      return mockTerraformResourcesResponse
    },
  }),
})
