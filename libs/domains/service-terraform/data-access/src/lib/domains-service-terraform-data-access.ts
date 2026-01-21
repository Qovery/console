import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type AxiosError } from 'axios'
import { TerraformMainCallsApi, TerraformResourcesApi, type TerraformResourcesResponse } from 'qovery-typescript-axios'
import { type TerraformResource } from './terraform.interface'

const terraformMainCallsApi = new TerraformMainCallsApi()
const terraformResourcesApi = new TerraformResourcesApi()

class ResourcesNotAppliedError extends Error {
  constructor() {
    super('Terraform resources have not been applied yet')
    this.name = 'ResourcesNotAppliedError'
  }
}

function transformApiResponse(response: TerraformResourcesResponse): TerraformResource[] {
  return response.results.map((item) => {
    const resourceType = item.resource_type || ''
    const displayName = resourceType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      id: item.id,
      resourceType,
      name: item.name,
      address: item.address,
      provider: item.provider,
      mode: item.mode,
      attributes: item.attributes,
      extractedAt: item.extracted_at || '',
      displayName,
    } as TerraformResource
  })
}

export const serviceTerraform = createQueryKeys('serviceTerraform', {
  listAvailableVersions: () => ({
    queryKey: ['listTerraformAvailableVersion'],
    async queryFn() {
      const response = await terraformMainCallsApi.listTerraformVersions()
      return response.data.results
    },
  }),
  listResources: (terraformId: string) => ({
    queryKey: [terraformId, 'resources'],
    async queryFn(): Promise<TerraformResource[]> {
      const response = await terraformResourcesApi.getTerraformResources(terraformId)
      return transformApiResponse(response.data)
    },
  }),
})
