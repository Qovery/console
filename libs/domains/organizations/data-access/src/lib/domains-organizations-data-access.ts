import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type AwsCredentialsRequest,
  BillingApi,
  type BillingInfoRequest,
  CloudProviderCredentialsApi,
  type CloudProviderEnum,
  ContainerRegistriesApi,
  type ContainerRegistryRequest,
  type CreditCardRequest,
  type DoCredentialsRequest,
  type GitProviderEnum,
  type GitTokenRequest,
  type InviteMemberRequest,
  type MemberRoleUpdateRequest,
  MembersApi,
  OrganizationAccountGitRepositoriesApi,
  OrganizationApiTokenApi,
  type OrganizationApiTokenCreateRequest,
  OrganizationApiTokenScope,
  OrganizationCustomRoleApi,
  type OrganizationCustomRoleCreateRequest,
  type OrganizationCustomRoleUpdateRequest,
  OrganizationMainCallsApi,
  OrganizationWebhookApi,
  type OrganizationWebhookCreateRequest,
  type ScalewayCredentialsRequest,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { refactoOrganizationCustomRolePayload } from '@qovery/shared/util-js'
import { type DistributiveOmit } from '@qovery/shared/util-types'

const containerRegistriesApi = new ContainerRegistriesApi()
const organizationApi = new OrganizationMainCallsApi()
const gitApi = new OrganizationAccountGitRepositoriesApi()
const apiTokenApi = new OrganizationApiTokenApi()
const webhookApi = new OrganizationWebhookApi()
const cloudProviderCredentialsApi = new CloudProviderCredentialsApi()
const billingApi = new BillingApi()
const customRolesApi = new OrganizationCustomRoleApi()
const membersApi = new MembersApi()

type CredentialRequest =
  | {
      organizationId: string
      cloudProvider: CloudProviderEnum
      payload: AwsCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: CloudProviderEnum
      payload: ScalewayCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: CloudProviderEnum
      payload: DoCredentialsRequest
      credentialId: string
    }

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
  cloudProviderCredentials: ({
    organizationId,
    cloudProvider,
  }: {
    organizationId: string
    cloudProvider: CloudProviderEnum
  }) => ({
    queryKey: [organizationId, cloudProvider],
    async queryFn() {
      const cloudProviders = await match(cloudProvider)
        .with('AWS', async () => {
          const response = await cloudProviderCredentialsApi.listAWSCredentials(organizationId)
          return response.data.results
        })
        .with('SCW', async () => {
          const response = await cloudProviderCredentialsApi.listScalewayCredentials(organizationId)
          return response.data.results
        })
        /*
         * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
         */
        .with('DO', async () => {
          const response = await cloudProviderCredentialsApi.listDOCredentials(organizationId)
          return response.data.results
        })
        .exhaustive()

      return cloudProviders
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
    queryKey: [organizationId],
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
  async createCloudProviderCredential(request: DistributiveOmit<CredentialRequest, 'credentialId'>) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createAWSCredentials(
          organizationId,
          payload as AwsCredentialsRequest
        )
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createScalewayCredentials(organizationId, payload)
        return response.data
      })
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createDOCredentials(organizationId, payload)
        return response.data
      })
      .exhaustive()

    return cloudProviderCredential
  },
  async editCloudProviderCredential(request: CredentialRequest) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editAWSCredentials(
          organizationId,
          credentialId,
          payload as AwsCredentialsRequest
        )
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editScalewayCredentials(
          organizationId,
          credentialId,
          payload
        )
        return response.data
      })
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editDOCredentials(organizationId, credentialId, payload)
        return response.data
      })
      .exhaustive()

    return cloudProviderCredential
  },
  async deleteCloudProviderCredential(request: DistributiveOmit<CredentialRequest, 'payload'>) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteAWSCredentials(credentialId, organizationId)
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteScalewayCredentials(credentialId, organizationId)
        return response.data
      })
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteDOCredentials(credentialId, organizationId)
        return response.data
      })
      .exhaustive()

    return cloudProviderCredential
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
}
