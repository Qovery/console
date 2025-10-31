import { useQuery } from '@tanstack/react-query'
import { TerraformVersionResponseEngineEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export function useTerraformAvailableVersion() {
  return useQuery({
    ...queries.serviceTerraform.listAvailableVersions(),
    select(versions) {
      // We only support Terraform engine for now
      return verisons?.filter(({ engine }) => engine === TerraformVersionResponseEngineEnum.TERRAFORM)
    },
  })
}

export default useTerraformAvailableVersion
