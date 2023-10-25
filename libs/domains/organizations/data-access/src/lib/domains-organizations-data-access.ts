import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ContainerRegistriesApi,
  GitProviderEnum,
  OrganizationAccountGitRepositoriesApi,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'

const containerRegistriesApi = new ContainerRegistriesApi()
const organizationApi = new OrganizationMainCallsApi()
const gitApi = new OrganizationAccountGitRepositoriesApi()

export const organizations = createQueryKeys('organizations', {
  containerRegistries: ({ organizationdId }) => ({
    queryKey: [organizationdId],
    async queryFn() {
      const response = await containerRegistriesApi.listContainerRegistry(organizationdId)
      return response.data.results
    },
  }),
  containerRegistry: ({ organizationdId, containerRegistryId }) => ({
    queryKey: [organizationdId, containerRegistryId],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerRegistry(organizationdId, containerRegistryId)
      return response.data
    },
  }),
  gitTokens: (organizationdId) => ({
    queryKey: [organizationdId],
    async queryFn() {
      const response = await organizationApi.listOrganizationGitTokens(organizationdId)
      return response.data.results
    },
  }),
  authProviders: (organizationId) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await gitApi.getOrganizationGitProviderAccount(organizationId)
      return response.data
    },
  }),
  repositories: ({ organizationId, gitProvider, gitToken }) => ({
    queryKey: [organizationId, gitProvider, gitToken],
    async queryFn() {
      if (gitProvider === GitProviderEnum.GITHUB) {
        const response = await gitApi.getOrganizationGithubRepositories(organizationId, gitToken)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.GITLAB) {
        const response = await gitApi.getOrganizationGitlabRepositories(organizationId, gitToken)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.BITBUCKET) {
        const response = await gitApi.getOrganizationBitbucketRepositories(organizationId, gitToken)
        return response.data.results
      }

      return Promise.all([])
    },
  }),
  branches: ({ organizationId, gitProvider, name, gitToken }) => ({
    queryKey: [organizationId, gitProvider, name],
    async queryFn() {
      if (gitProvider === GitProviderEnum.GITHUB) {
        const response = await gitApi.getOrganizationGithubRepositoryBranches(organizationId, gitToken, name)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.GITLAB) {
        const response = await gitApi.getOrganizationGitlabRepositoryBranches(organizationId, gitToken, name)
        return response.data.results
      }
      if (gitProvider === GitProviderEnum.BITBUCKET) {
        const response = await gitApi.getOrganizationBitbucketRepositoryBranches(organizationId, gitToken, name)
        return response.data.results
      }

      return Promise.all([])
    },
  }),
})

export type OrganizationsKeys = inferQueryKeys<typeof organizations>
