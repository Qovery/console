import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ContainerRegistriesApi,
  type GitProviderEnum,
  type GitRepository,
  OrganizationAccountGitRepositoriesApi,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

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
      const repositories = await match(gitProvider)
        .with('GITHUB', async () => {
          const response = await gitApi.getOrganizationGithubRepositories(organizationId, gitToken)
          return response.data as GitRepository[]
        })
        .with('GITLAB', async () => {
          const response = await gitApi.getOrganizationGitlabRepositories(organizationId, gitToken)
          return response.data as GitRepository[]
        })
        .with('BITBUCKET', async () => {
          const response = await gitApi.getOrganizationBitbucketRepositories(organizationId, gitToken)
          return response.data as GitRepository[]
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
})

export type OrganizationsKeys = inferQueryKeys<typeof organizations>
