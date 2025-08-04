import { type TerraformRequest, TerraformsApi } from 'qovery-typescript-axios'

const terraformsApi = new TerraformsApi()

export const mutations = {
  async createTerraformService({
    environmentId,
    terraformRequest,
  }: {
    environmentId: string
    terraformRequest: TerraformRequest
  }) {
    const response = await terraformsApi.createTerraform(environmentId, terraformRequest)
    return response.data
  },
}
