import { TerraformEngineEnum } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'

export const TERRAFORM_ENGINES = [
  { name: 'Terraform', value: TerraformEngineEnum.TERRAFORM, icon: IconEnum.TERRAFORM },
  { name: 'OpenTofu', value: TerraformEngineEnum.OPEN_TOFU, icon: IconEnum.OPEN_TOFU },
]
