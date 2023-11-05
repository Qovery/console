import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  ContainerRegistriesApi,
  type ContainerRegistryRequest,
  type GitProviderEnum,
  type GitTokenRequest,
  OrganizationAccountGitRepositoriesApi,
  OrganizationApiTokenApi,
  type OrganizationApiTokenCreateRequest,
  OrganizationApiTokenScope,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

const containerRegistriesApi = new ContainerRegistriesApi()
const organizationApi = new OrganizationMainCallsApi()
const gitApi = new OrganizationAccountGitRepositoriesApi()
const apiTokenApi = new OrganizationApiTokenApi()

export const organizations = createQueryKeys('organizations', {
  containerRegistries: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await containerRegistriesApi.listContainerRegistry(organizationId)
      return response.data.results
    },
  }),
  containerRegistry: ({
    organizationId,
    containerRegistryId,
  }: {
    organizationId: string
    containerRegistryId: string
  }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerRegistry(organizationId, containerRegistryId)
      return response.data
    },
  }),
  availableContainerRegistry: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await containerRegistriesApi.listAvailableContainerRegistry()
      return response.data.results
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
      return response.data.results
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
      const repositories = await match(gitProvider)
        .with('GITHUB', async () => {
          const response = await gitApi.getOrganizationGithubRepositories(organizationId, gitToken)
          return response.data.results
        })
        .with('GITLAB', async () => {
          const response = await gitApi.getOrganizationGitlabRepositories(organizationId, gitToken)
          return response.data.results
        })
        .with('BITBUCKET', async () => {
          const response = await gitApi.getOrganizationBitbucketRepositories(organizationId, gitToken)
          return response.data.results
        })
        .exhaustive()

      return repositories
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
      const branches = await match(gitProvider)
        .with('GITHUB', async () => {
          const response = await gitApi.getOrganizationGithubRepositoryBranches(organizationId, name, gitToken)
          return response.data.results
        })
        .with('GITLAB', async () => {
          const response = await gitApi.getOrganizationGitlabRepositoryBranches(organizationId, name, gitToken)
          return response.data.results
        })
        .with('BITBUCKET', async () => {
          const response = await gitApi.getOrganizationBitbucketRepositoryBranches(organizationId, name, gitToken)
          return response.data.results
        })
        .exhaustive()

      return branches
    },
  }),
  apiTokens: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await apiTokenApi.listOrganizationApiTokens(organizationId)
      return response.data.results
    },
  }),
})

export const mutations = {
  async editContainerRegistry({
    organizationId,
    containerRegistryId,
    containerRegistryRequest,
  }: {
    organizationId: string
    containerRegistryId: string
    containerRegistryRequest: ContainerRegistryRequest
  }) {
    const response = await containerRegistriesApi.editContainerRegistry(
      organizationId,
      containerRegistryId,
      containerRegistryRequest
    )
    return response.data
  },
  async createContainerRegistry({
    organizationId,
    containerRegistryRequest,
  }: {
    organizationId: string
    containerRegistryRequest: ContainerRegistryRequest
  }) {
    const response = await containerRegistriesApi.createContainerRegistry(organizationId, containerRegistryRequest)
    return response.data
  },
  async deleteContainerRegistry({
    organizationId,
    containerRegistryId,
  }: {
    organizationId: string
    containerRegistryId: string
  }) {
    const response = await containerRegistriesApi.deleteContainerRegistry(organizationId, containerRegistryId)
    return response.data
  },
  async deleteGitToken({ organizationId, gitTokenId }: { organizationId: string; gitTokenId: string }) {
    const response = await organizationApi.deleteGitToken(organizationId, gitTokenId)
    return response.data
  },
  async editGitToken({
    organizationId,
    gitTokenId,
    gitTokenRequest,
  }: {
    organizationId: string
    gitTokenId: string
    gitTokenRequest: GitTokenRequest
  }) {
    const response = await organizationApi.editGitToken(organizationId, gitTokenId, gitTokenRequest)
    return response.data
  },
  async createGitToken({
    organizationId,
    gitTokenRequest,
  }: {
    organizationId: string
    gitTokenRequest: GitTokenRequest
  }) {
    const response = await organizationApi.createGitToken(organizationId, gitTokenRequest)
    return response.data
  },
  async deleteApiToken({ organizationId, apiTokenId }: { organizationId: string; apiTokenId: string }) {
    const response = await apiTokenApi.deleteOrganizationApiToken(organizationId, apiTokenId)
    return response.data
  },
  async createApiToken({
    organizationId,
    apiTokenCreateRequest,
  }: {
    organizationId: string
    apiTokenCreateRequest: OrganizationApiTokenCreateRequest
  }) {
    const response = await apiTokenApi.createOrganizationApiToken(organizationId, {
      ...apiTokenCreateRequest,
      // Role for token is not available in the API
      scope: OrganizationApiTokenScope.ADMIN,
    })
    return response.data
  },
}
