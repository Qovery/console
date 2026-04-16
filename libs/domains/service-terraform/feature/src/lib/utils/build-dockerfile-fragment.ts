import { type TerraformRequestDockerfileFragment } from 'qovery-typescript-axios'
import { type TerraformGeneralData } from '../terraform-general-data/terraform-general-data'

export function buildDockerfileFragment(data: TerraformGeneralData): TerraformRequestDockerfileFragment | null {
  switch (data.dockerfile_fragment_source) {
    case 'file':
      return data.dockerfile_fragment_path ? { type: 'file', path: data.dockerfile_fragment_path } : null
    case 'inline':
      return data.dockerfile_fragment_content ? { type: 'inline', content: data.dockerfile_fragment_content } : null
    case 'none':
    default:
      return null
  }
}
