import {
  type ApplicationGitRepository,
  type GitProviderEnum,
  type GitTokenResponse,
  type TerraformAutoDeployConfigTerraformActionEnum,
  type TerraformRequest,
  type TerraformRequestDockerfileFragment,
} from 'qovery-typescript-axios'

export type DockerfileFragmentSource = 'none' | 'file' | 'inline'

export interface TerraformGeneralData
  extends Omit<
    TerraformRequest,
    'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec' | 'dockerfile_fragment' | 'auto_deploy_config'
  > {
  auto_deploy: boolean
  terraform_action: TerraformAutoDeployConfigTerraformActionEnum
  source_provider: 'GIT'
  repository: string
  git_repository?: ApplicationGitRepository
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments: string
  timeout_sec: string
  provider_version: {
    read_from_terraform_block: boolean
    explicit_version: string
  }
  dockerfile_fragment_source: DockerfileFragmentSource
  dockerfile_fragment_path?: string
  dockerfile_fragment_content?: string
  dockerfile_fragment?: TerraformRequestDockerfileFragment | null
}

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

export function extractDockerfileFragmentFields(fragment: TerraformRequestDockerfileFragment | null | undefined): {
  dockerfile_fragment_source: DockerfileFragmentSource
  dockerfile_fragment_path?: string
  dockerfile_fragment_content?: string
} {
  if (!fragment) {
    return { dockerfile_fragment_source: 'none' }
  }
  if (fragment.type === 'file' && 'path' in fragment) {
    return {
      dockerfile_fragment_source: 'file',
      dockerfile_fragment_path: fragment.path,
    }
  }
  if (fragment.type === 'inline' && 'content' in fragment) {
    return {
      dockerfile_fragment_source: 'inline',
      dockerfile_fragment_content: fragment.content,
    }
  }
  return { dockerfile_fragment_source: 'none' }
}
