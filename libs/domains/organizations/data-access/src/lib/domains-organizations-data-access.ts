import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  BillingApi,
  type BillingInfoRequest,
  ContainerRegistriesApi,
  type ContainerRegistryRequest,
  type CreditCardRequest,
  type GitProviderEnum,
  type GitTokenRequest,
  GithubAppApi,
  HelmRepositoriesApi,
  type HelmRepositoryRequest,
  type InviteMemberRequest,
  type MemberRoleUpdateRequest,
  MembersApi,
  OrganizationAccountGitRepositoriesApi,
  OrganizationAnnotationsGroupApi,
  type OrganizationAnnotationsGroupCreateRequest,
  OrganizationApiTokenApi,
  type OrganizationApiTokenCreateRequest,
  OrganizationApiTokenScope,
  type OrganizationBillingUsageReportRequest,
  OrganizationCustomRoleApi,
  type OrganizationCustomRoleCreateRequest,
  type OrganizationCustomRoleUpdateRequest,
  type OrganizationEditRequest,
  type OrganizationGithubAppConnectRequest,
  OrganizationLabelsGroupApi,
  type OrganizationLabelsGroupCreateRequest,
  OrganizationMainCallsApi,
  type OrganizationRequest,
  OrganizationWebhookApi,
  type OrganizationWebhookCreateRequest,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { refactoOrganizationCustomRolePayload, refactoOrganizationPayload } from '@qovery/shared/util-js'

const annotationsGroupApi = new OrganizationAnnotationsGroupApi()
const labelsGroupApi = new OrganizationLabelsGroupApi()
const containerRegistriesApi = new ContainerRegistriesApi()
const helmRepositoriesApi = new HelmRepositoriesApi()
const organizationApi = new OrganizationMainCallsApi()
const gitApi = new OrganizationAccountGitRepositoriesApi()
const apiTokenApi = new OrganizationApiTokenApi()
const webhookApi = new OrganizationWebhookApi()
const billingApi = new BillingApi()
const customRolesApi = new OrganizationCustomRoleApi()
const membersApi = new MembersApi()
const githubAppApi = new GithubAppApi()

export const organizations = createQueryKeys('organizations', {
  list: {
    queryKey: null,
    async queryFn() {
      const response = await organizationApi.listOrganization()
      return response.data.results
    },
  },
  details: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await organizationApi.getOrganization(organizationId)
      return response.data
    },
  }),
  helmRepositories: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await helmRepositoriesApi.listHelmRepository(organizationId)
      return response.data.results
    },
  }),
  helmRepository: ({ organizationId, helmRepositoryId }: { organizationId: string; helmRepositoryId: string }) => ({
    queryKey: [organizationId, helmRepositoryId],
    async queryFn() {
      const response = await helmRepositoriesApi.getHelmRepository(organizationId, helmRepositoryId)
      return response.data
    },
  }),
  availableHelmRepositories: {
    queryKey: null,
    async queryFn() {
      const response = await helmRepositoriesApi.listAvailableHelmRepository()
      return response.data.results
    },
  },
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
    queryKey: [organizationId, containerRegistryId],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerRegistry(organizationId, containerRegistryId)
      return response.data
    },
  }),
  containerImages: ({
    organizationId,
    containerRegistryId,
    search,
  }: {
    organizationId: string
    containerRegistryId: string
    search: string
  }) => ({
    queryKey: [organizationId, containerRegistryId, search],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerVersions(
        organizationId,
        containerRegistryId,
        undefined,
        search
      )
      return response.data.results
    },
  }),
  containerVersions: ({
    organizationId,
    containerRegistryId,
    imageName,
  }: {
    organizationId: string
    containerRegistryId: string
    imageName: string
  }) => ({
    queryKey: [organizationId, containerRegistryId, imageName],
    async queryFn() {
      const response = await containerRegistriesApi.getContainerVersions(organizationId, containerRegistryId, imageName)
      return response.data.results
    },
  }),
  availableContainerRegistries: {
    queryKey: null,
    async queryFn() {
      const response = await containerRegistriesApi.listAvailableContainerRegistry()
      return response.data.results
    },
  },
  gitTokens: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await organizationApi.listOrganizationGitTokens(organizationId)
      return response.data.results
    },
  }),
  gitTokenAssociatedServices: ({ organizationId, gitTokenId }: { organizationId: string; gitTokenId: string }) => ({
    queryKey: [organizationId, gitTokenId],
    async queryFn() {
      const response = await organizationApi.getGitTokenAssociatedServices(organizationId, gitTokenId)
      return response.data.results
    },
  }),
  helmRepositoryAssociatedServices: ({
    organizationId,
    helmRepositoryId,
  }: {
    organizationId: string
    helmRepositoryId: string
  }) => ({
    queryKey: [organizationId, helmRepositoryId],
    async queryFn() {
      const response = await organizationApi.getHelmRepositoryAssociatedServices(organizationId, helmRepositoryId)
      return response.data.results
    },
  }),
  containerRegistryAssociatedServices: ({
    organizationId,
    containerRegistryId,
  }: {
    organizationId: string
    containerRegistryId: string
  }) => ({
    queryKey: [organizationId, containerRegistryId],
    async queryFn() {
      const response = await organizationApi.getContainerRegistryAssociatedServices(organizationId, containerRegistryId)
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
  labelsGroups: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await labelsGroupApi.listOrganizationLabelsGroup(organizationId)
      return response.data.results
    },
  }),
  labelsGroupAssociatedItems: ({
    organizationId,
    labelsGroupId,
  }: {
    organizationId: string
    labelsGroupId: string
  }) => ({
    queryKey: [organizationId, labelsGroupId],
    async queryFn() {
      const response = await labelsGroupApi.getOrganizationLabelsGroupAssociatedItems(organizationId, labelsGroupId)
      return response.data.results
    },
  }),
  annotationsGroups: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await annotationsGroupApi.listOrganizationAnnotationsGroup(organizationId)
      return response.data.results
    },
  }),
  annotationsGroupAssociatedItems: ({
    organizationId,
    annotationsGroupId,
  }: {
    organizationId: string
    annotationsGroupId: string
  }) => ({
    queryKey: [organizationId, annotationsGroupId],
    async queryFn() {
      const response = await annotationsGroupApi.getOrganizationAnnotationsGroupAssociatedItems(
        organizationId,
        annotationsGroupId
      )
      return response.data.results
    },
  }),
  apiTokens: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await apiTokenApi.listOrganizationApiTokens(organizationId)
      return response.data.results
    },
  }),
  webhooks: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await webhookApi.listOrganizationWebHooks(organizationId)
      return response.data.results
    },
  }),
  billingInfo: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await billingApi.getOrganizationBillingInfo(organizationId)
      return response.data
    },
  }),
  currentCost: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const result = await billingApi.getOrganizationCurrentCost(organizationId)
      return result.data
    },
  }),
  invoices: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const result = await billingApi.listOrganizationInvoice(organizationId)
      return result.data.results
    },
  }),
  creditCards: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await billingApi.listOrganizationCreditCards(organizationId)
      return response.data.results
    },
  }),
  availableRoles: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await organizationApi.listOrganizationAvailableRoles(organizationId)
      return response.data.results
    },
  }),
  customRole: ({ organizationId, customRoleId }: { organizationId: string; customRoleId: string }) => ({
    queryKey: [organizationId, customRoleId],
    async queryFn() {
      const response = await customRolesApi.getOrganizationCustomRole(organizationId, customRoleId)
      return response.data
    },
  }),
  members: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await membersApi.getOrganizationMembers(organizationId)
      return response.data.results
    },
  }),
  inviteMembers: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await membersApi.getOrganizationInvitedMembers(organizationId)
      return response.data.results
    },
  }),
  memberInvitation: ({ organizationId, inviteId }: { organizationId: string; inviteId: string }) => ({
    queryKey: [organizationId, inviteId],
    async queryFn() {
      const response = await membersApi.getMemberInvitation(organizationId, inviteId)
      return response.data
    },
  }),
})

export const mutations = {
  async deleteAnnotationsGroup({
    organizationId,
    annotationsGroupId,
  }: {
    organizationId: string
    annotationsGroupId: string
  }) {
    const response = await annotationsGroupApi.deleteOrganizationAnnotationsGroup(organizationId, annotationsGroupId)
    return response.data
  },
  async deleteLabelsGroup({ organizationId, labelsGroupId }: { organizationId: string; labelsGroupId: string }) {
    const response = await labelsGroupApi.deleteOrganizationLabelsGroup(organizationId, labelsGroupId)
    return response.data
  },
  async createLabelsGroup({
    organizationId,
    labelsGroupRequest,
  }: {
    organizationId: string
    labelsGroupRequest: OrganizationLabelsGroupCreateRequest
  }) {
    const response = await labelsGroupApi.createOrganizationLabelsGroup(organizationId, labelsGroupRequest)
    return response.data
  },
  async createAnnotationsGroup({
    organizationId,
    annotationsGroupRequest,
  }: {
    organizationId: string
    annotationsGroupRequest: OrganizationAnnotationsGroupCreateRequest
  }) {
    const response = await annotationsGroupApi.createOrganizationAnnotationsGroup(
      organizationId,
      annotationsGroupRequest
    )
    return response.data
  },
  async editLabelsGroup({
    organizationId,
    labelsGroupId,
    labelsGroupRequest,
  }: {
    organizationId: string
    labelsGroupId: string
    labelsGroupRequest: OrganizationLabelsGroupCreateRequest
  }) {
    const response = await labelsGroupApi.editOrganizationLabelsGroup(organizationId, labelsGroupId, labelsGroupRequest)
    return response.data
  },
  async editAnnotationsGroup({
    organizationId,
    annotationsGroupId,
    annotationsGroupRequest,
  }: {
    organizationId: string
    annotationsGroupId: string
    annotationsGroupRequest: OrganizationAnnotationsGroupCreateRequest
  }) {
    const response = await annotationsGroupApi.editOrganizationAnnotationsGroup(
      organizationId,
      annotationsGroupId,
      annotationsGroupRequest
    )
    return response.data
  },
  async editHelmRepository({
    organizationId,
    helmRepositoryId,
    helmRepositoryRequest,
  }: {
    organizationId: string
    helmRepositoryId: string
    helmRepositoryRequest: HelmRepositoryRequest
  }) {
    const response = await helmRepositoriesApi.editHelmRepository(
      organizationId,
      helmRepositoryId,
      helmRepositoryRequest
    )
    return response.data
  },
  async createHelmRepository({
    organizationId,
    helmRepositoryRequest,
  }: {
    organizationId: string
    helmRepositoryRequest: HelmRepositoryRequest
  }) {
    const response = await helmRepositoriesApi.createHelmRepository(organizationId, helmRepositoryRequest)
    return response.data
  },
  async deleteHelmRepository({
    organizationId,
    helmRepositoryId,
  }: {
    organizationId: string
    helmRepositoryId: string
  }) {
    const response = await helmRepositoriesApi.deleteHelmRepository(organizationId, helmRepositoryId)
    return response.data
  },
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
  async generateBillingUsageReport({
    organizationId,
    usageReportRequest,
  }: {
    organizationId: string
    usageReportRequest: OrganizationBillingUsageReportRequest
  }) {
    const response = await billingApi.generateBillingUsageReport(organizationId, usageReportRequest)
    return response.data
  },
  async createWebhook({
    organizationId,
    webhookRequest,
  }: {
    organizationId: string
    webhookRequest: OrganizationWebhookCreateRequest
  }) {
    const response = await webhookApi.createOrganizationWebhook(organizationId, webhookRequest)
    return response.data
  },
  async editWebhook({
    organizationId,
    webhookId,
    webhookRequest,
  }: {
    organizationId: string
    webhookId: string
    webhookRequest: OrganizationWebhookCreateRequest
  }) {
    const response = await webhookApi.editOrganizationWebhook(organizationId, webhookId, webhookRequest)
    return response.data
  },
  async deleteWebhook({ organizationId, webhookId }: { organizationId: string; webhookId: string }) {
    const response = await webhookApi.deleteOrganizationWebhook(organizationId, webhookId)
    return response.data
  },
  async invoiceUrl({ organizationId, invoiceId }: { organizationId: string; invoiceId: string }) {
    const response = await billingApi.getOrganizationInvoicePDF(organizationId, invoiceId)
    return response.data
  },
  async editBillingInfo({
    organizationId,
    billingInfoRequest,
  }: {
    organizationId: string
    billingInfoRequest: BillingInfoRequest
  }) {
    const response = await billingApi.editOrganizationBillingInfo(organizationId, billingInfoRequest)
    return response.data
  },
  async addCreditCode({ organizationId, code }: { organizationId: string; code: string }) {
    const response = await billingApi.addCreditCode(organizationId, { code: code })
    return response.data
  },
  async addCreditCard({
    organizationId,
    creditCardRequest,
  }: {
    organizationId: string
    creditCardRequest: CreditCardRequest
  }) {
    // if expiryYear does not have 4 digits, we add 2000 to it
    if (creditCardRequest.expiry_year < 1000) {
      creditCardRequest.expiry_year += 2000
    }

    const response = await billingApi.addCreditCard(organizationId, creditCardRequest)
    return response.data
  },
  async deleteCreditCard({ organizationId, creditCardId }: { organizationId: string; creditCardId: string }) {
    const response = await billingApi.deleteCreditCard(organizationId, creditCardId)
    return response.data
  },
  async editCustomRole({
    organizationId,
    customRoleId,
    customRoleUpdateRequest,
  }: {
    organizationId: string
    customRoleId: string
    customRoleUpdateRequest: OrganizationCustomRoleUpdateRequest
  }) {
    const cloneCustomRole = Object.assign({}, refactoOrganizationCustomRolePayload(customRoleUpdateRequest))
    const response = await customRolesApi.editOrganizationCustomRole(organizationId, customRoleId, cloneCustomRole)
    return response.data
  },
  async createCustomRole({
    organizationId,
    customRoleUpdateRequest,
  }: {
    organizationId: string
    customRoleUpdateRequest: OrganizationCustomRoleCreateRequest
  }) {
    const response = await customRolesApi.createOrganizationCustomRole(organizationId, customRoleUpdateRequest)
    return response.data
  },
  async deleteCustomRole({ organizationId, customRoleId }: { organizationId: string; customRoleId: string }) {
    const response = await customRolesApi.deleteOrganizationCustomRole(organizationId, customRoleId)
    return response.data
  },
  async deleteInviteMember({ organizationId, inviteId }: { organizationId: string; inviteId: string }) {
    const response = await membersApi.deleteInviteMember(organizationId, inviteId)
    return response.data
  },
  async createInviteMember({
    organizationId,
    inviteMemberRequest,
  }: {
    organizationId: string
    inviteMemberRequest: InviteMemberRequest
  }) {
    const response = await membersApi.postInviteMember(organizationId, inviteMemberRequest)
    return response.data
  },
  async deleteMember({ organizationId, userId }: { organizationId: string; userId: string }) {
    const response = await membersApi.deleteMember(organizationId, { user_id: userId })
    return response.data
  },
  async editMemberRole({
    organizationId,
    memberRoleUpdateRequest,
  }: {
    organizationId: string
    memberRoleUpdateRequest: MemberRoleUpdateRequest
  }) {
    const response = await membersApi.editOrganizationMemberRole(organizationId, memberRoleUpdateRequest)
    return response.data
  },
  async transferOwnershipMemberRole({ organizationId, userId }: { organizationId: string; userId: string }) {
    const response = await membersApi.postOrganizationTransferOwnership(organizationId, {
      user_id: userId,
    })
    return response.data
  },
  async deleteOrganization({ organizationId }: { organizationId: string }) {
    const response = await organizationApi.deleteOrganization(organizationId)
    return response.data
  },
  async createOrganization({ organizationRequest }: { organizationRequest: OrganizationRequest }) {
    const result = await organizationApi.createOrganization(organizationRequest)
    return result.data
  },
  async editOrganization({
    organizationId,
    organizationRequest,
  }: {
    organizationId: string
    organizationRequest: OrganizationEditRequest
  }) {
    const response = await organizationApi.editOrganization(
      organizationId,
      refactoOrganizationPayload(organizationRequest)
    )
    return response.data
  },
  async connectGithubApp({
    organizationId,
    appConnectRequest,
  }: {
    organizationId: string
    appConnectRequest: OrganizationGithubAppConnectRequest
  }) {
    const response = await githubAppApi.organizationGithubAppConnect(organizationId, appConnectRequest)
    return response.data
  },
  async disconnectGithubApp({ organizationId, force }: { organizationId: string; force?: boolean }) {
    const response = await githubAppApi.organizationGithubAppDisconnect(organizationId, force)
    return response.data
  },
  async acceptInviteMember({ organizationId, inviteId }: { organizationId: string; inviteId: string }) {
    const response = await membersApi.postAcceptInviteMember(organizationId, inviteId)
    return response.data
  },
}
