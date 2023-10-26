import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ContainerRegistriesApi,
  GitProviderEnum,
  GitRepository,
  OrganizationAccountGitRepositoriesApi,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'

const containerRegistriesApi = new ContainerRegistriesApi()
const organizationApi = new OrganizationMainCallsApi()
const gitApi = new OrganizationAccountGitRepositoriesApi()

export const organizations = createQueryKeys('organizations', {
  containerRegistries: ({ organizationId }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await containerRegistriesApi.listContainerRegistry(organizationId)
      return response.data.results
    },
  }),
  containerRegistry: ({ organizationId, containerRegistryId }) => ({
    queryKey: [organizationId, containerRegistryId],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerRegistry(organizationId, containerRegistryId)
      return response.data
    },
  }),
  gitTokens: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await organizationApi.listOrganizationGitTokens(organizationId)
      return response.data.results
    },
  }),
  authProviders: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await gitApi.getOrganizationGitProviderAccount(organizationId)
      return response.data
    },
  }),
  repositories: ({
    organizationId,
    gitProvider,
    gitToken,
  }: {
    organizationId: string
    gitProvider: GitProviderEnum
    gitToken?: string
  }) => ({
    queryKey: [organizationId, gitProvider, gitToken],
    async queryFn() {
      if (gitProvider === GitProviderEnum.GITHUB) {
        const response = await gitApi.getOrganizationGithubRepositories(organizationId, gitToken)
        return response.data as GitRepository[]
      }
      if (gitProvider === GitProviderEnum.GITLAB) {
        const response = await gitApi.getOrganizationGitlabRepositories(organizationId, gitToken)
        return response.data as GitRepository[]
      }
      if (gitProvider === GitProviderEnum.BITBUCKET) {
        const response = await gitApi.getOrganizationBitbucketRepositories(organizationId, gitToken)
        return response.data as GitRepository[]
      }

      return Promise.all([])
    },
  }),
  branches: ({
    organizationId,
    gitProvider,
    name,
    gitToken,
  }: {
    organizationId: string
    gitProvider: GitProviderEnum
    name: string
    gitToken?: string
  }) => ({
    queryKey: [organizationId, gitProvider, name],
    async queryFn() {
      if (gitProvider === GitProviderEnum.GITHUB) {
        const response = await gitApi.getOrganizationGithubRepositoryBranches(organizationId, name, gitToken)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.GITLAB) {
        const response = await gitApi.getOrganizationGitlabRepositoryBranches(organizationId, name, gitToken)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.BITBUCKET) {
        const response = await gitApi.getOrganizationBitbucketRepositoryBranches(organizationId, name, gitToken)
        return response.data.results
      }

      return Promise.all([])
    },
  }),
})

export type OrganizationsKeys = inferQueryKeys<typeof organizations>
