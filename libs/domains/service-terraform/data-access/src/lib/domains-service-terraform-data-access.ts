import { createQueryKeys } from '@lukemorales/query-key-factory'
import { TerraformMainCallsApi } from 'qovery-typescript-axios'

const terraformApi = new TerraformMainCallsApi()

export const serviceTerraform = createQueryKeys('serviceTerraform', {
  listAvailableVersions: () => ({
    queryKey: ['listTerraformAvailableVersion'],
    async queryFn() {
      const response = await terraformApi.listTerraformVersions()
      return response.data.results
    },
  }),
})
