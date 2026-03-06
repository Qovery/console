import { type GitProviderEnum, type GitRepository, type GitTokenResponse } from 'qovery-typescript-axios'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { guessGitProvider } from '@qovery/shared/util-git'

export interface ClusterEksSettingsFormData extends ClusterResourcesData {
  branch?: string
  repository?: string
  git_repository?: GitRepository
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  git_token_name?: GitTokenResponse['name']
  root_path?: string
}

const trimRepositorySuffix = (value: string): string => value.replace(/\.git$/, '').replace(/^\/+|\/+$/g, '')

const extractRepositoryNameFromUrl = (url?: string): string => {
  if (!url) return ''

  try {
    const parsedUrl = new URL(url)
    return trimRepositorySuffix(parsedUrl.pathname)
  } catch {
    const sshRepositoryMatch = url.match(/^[^@]+@[^:]+:(.+)$/)
    if (sshRepositoryMatch?.[1]) {
      return trimRepositorySuffix(sshRepositoryMatch[1])
    }

    return ''
  }
}

export const getEksAnywhereGitFormValues = (
  resourcesData?: Pick<ClusterResourcesData, 'infrastructure_charts_parameters'>
): Pick<
  ClusterEksSettingsFormData,
  'provider' | 'git_token_id' | 'repository' | 'git_repository' | 'branch' | 'root_path' | 'is_public_repository'
> => {
  const eksAnywhereParameters = resourcesData?.infrastructure_charts_parameters?.eks_anywhere_parameters
  const gitRepository = eksAnywhereParameters?.git_repository
  const repositoryName = extractRepositoryNameFromUrl(gitRepository?.url)

  return {
    provider: gitRepository?.provider ?? guessGitProvider(gitRepository?.url ?? ''),
    git_token_id: gitRepository?.git_token_id,
    repository: repositoryName,
    git_repository: gitRepository?.url
      ? ({
          id: '',
          name: repositoryName,
          url: gitRepository.url,
          default_branch: gitRepository.branch,
        } as GitRepository)
      : undefined,
    branch: gitRepository?.branch,
    root_path: eksAnywhereParameters?.yaml_file_path,
    is_public_repository: false,
  }
}

export const getInfrastructureChartsParametersWithEksAnywhereGit = (
  data: ClusterEksSettingsFormData
): ClusterResourcesData['infrastructure_charts_parameters'] => {
  const currentEksAnywhereParameters = data.infrastructure_charts_parameters?.eks_anywhere_parameters
  const repositoryUrl = data.is_public_repository ? data.repository : data.git_repository?.url
  const yamlFilePath = data.root_path ?? currentEksAnywhereParameters?.yaml_file_path
  const gitTokenId = data.git_token_id ?? currentEksAnywhereParameters?.git_repository?.git_token_id ?? ''

  if (!repositoryUrl || !yamlFilePath) {
    return data.infrastructure_charts_parameters
  }

  return {
    ...data.infrastructure_charts_parameters,
    eks_anywhere_parameters: {
      git_repository: {
        url: repositoryUrl,
        branch: data.branch ?? currentEksAnywhereParameters?.git_repository?.branch,
        git_token_id: gitTokenId,
        provider: data.provider ?? currentEksAnywhereParameters?.git_repository?.provider,
      },
      yaml_file_path: yamlFilePath,
    },
  }
}

export const stripEksAnywhereGitFormFields = (data: ClusterEksSettingsFormData): ClusterResourcesData => {
  const clusterResourcesData: ClusterEksSettingsFormData = { ...data }
  delete clusterResourcesData.provider
  delete clusterResourcesData.git_token_id
  delete clusterResourcesData.git_token_name
  delete clusterResourcesData.repository
  delete clusterResourcesData.git_repository
  delete clusterResourcesData.branch
  delete clusterResourcesData.root_path
  delete clusterResourcesData.is_public_repository
  return clusterResourcesData
}
