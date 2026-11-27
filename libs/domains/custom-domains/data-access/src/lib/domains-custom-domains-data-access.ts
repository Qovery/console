import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationCustomDomainApi,
  ContainerCustomDomainApi,
  type CustomDomainBulkDeleteItemRequest,
  type CustomDomainRequest,
  type CustomDomainValidationRequest,
  EnvironmentCustomDomainApi,
  type EnvironmentCustomDomainRequest,
  HelmCustomDomainApi,
  OrganizationCustomDomainApi,
} from 'qovery-typescript-axios'
import { type ServiceType } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'

const customDomainApplicationApi = new ApplicationCustomDomainApi()
const customDomainContainerApi = new ContainerCustomDomainApi()
const customDomainHelmApi = new HelmCustomDomainApi()

const organizationCustomDomainApi = new OrganizationCustomDomainApi()
const environmentCustomDomainApi = new EnvironmentCustomDomainApi()

export interface OrganizationCustomDomainFilters {
  organizationId: string
  projectId?: string
  environmentId?: string
  search?: string
  page: number
  pageSize: number
}

export const customDomains = createQueryKeys('customDomains', {
  // The hostname new domains of the environment must CNAME to. `null` until the environment is first deployed.
  environmentCnameTarget: ({ environmentId }: { environmentId: string }) => ({
    queryKey: [environmentId],
    async queryFn() {
      try {
        const response = await environmentCustomDomainApi.getEnvironmentCustomDomainCnameTarget(environmentId)
        return response.data.cname_target
      } catch (error) {
        // Both AxiosError and the console interceptor's `{ message, response }` carry the status.
        if ((error as { response?: { status?: number } } | undefined)?.response?.status === 404) return null
        throw error
      }
    },
  }),
  organizationList: ({
    organizationId,
    projectId,
    environmentId,
    search,
    page,
    pageSize,
  }: OrganizationCustomDomainFilters) => ({
    queryKey: [organizationId, { projectId, environmentId, search, page, pageSize }],
    async queryFn({ signal }: { signal?: AbortSignal }) {
      const response = await organizationCustomDomainApi.listOrganizationCustomDomain(
        organizationId,
        projectId,
        environmentId,
        search,
        page,
        pageSize,
        { signal }
      )
      return response.data
    },
  }),
  // The DNS checks of the same page of domains as `organizationList` with the same filters, in one request.
  organizationCheck: ({
    organizationId,
    projectId,
    environmentId,
    search,
    page,
    pageSize,
  }: OrganizationCustomDomainFilters) => ({
    queryKey: [organizationId, { projectId, environmentId, search, page, pageSize }],
    async queryFn({ signal }: { signal?: AbortSignal }) {
      const response = await organizationCustomDomainApi.checkOrganizationCustomDomains(
        organizationId,
        projectId,
        environmentId,
        search,
        page,
        pageSize,
        { signal }
      )
      return response.data.results
    },
  }),
  customDomains: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
  }) => ({
    queryKey: [serviceId, serviceType],
    async queryFn() {
      const { query } = match(serviceType)
        .with('APPLICATION', (serviceType) => ({
          query: customDomainApplicationApi.listApplicationCustomDomain.bind(customDomainApplicationApi),
          serviceType,
        }))
        .with('CONTAINER', (serviceType) => ({
          query: customDomainContainerApi.listContainerCustomDomain.bind(customDomainContainerApi),
          serviceType,
        }))
        .with('HELM', (serviceType) => ({
          query: customDomainHelmApi.listHelmCustomDomain.bind(customDomainHelmApi),
          serviceType,
        }))
        .exhaustive()
      const response = await query(serviceId)
      return response.data.results
    },
  }),
})

export const mutations = {
  async createEnvironmentCustomDomain({
    environmentId,
    payload,
  }: {
    environmentId: string
    payload: EnvironmentCustomDomainRequest
  }) {
    const response = await environmentCustomDomainApi.createEnvironmentCustomDomain(environmentId, payload)
    return response.data
  },
  // Replaces every copy of the domain in the environment at once: all of them change, or none.
  async editEnvironmentCustomDomain({
    environmentId,
    domainName,
    payload,
  }: {
    environmentId: string
    domainName: string
    payload: EnvironmentCustomDomainRequest
  }) {
    const response = await environmentCustomDomainApi.editEnvironmentCustomDomain(environmentId, domainName, payload)
    return response.data
  },
  async deleteEnvironmentCustomDomain({ environmentId, domainName }: { environmentId: string; domainName: string }) {
    const response = await environmentCustomDomainApi.deleteEnvironmentCustomDomain(environmentId, domainName)
    return response.data
  },
  // Deletes domains of several environments: all of them, or none.
  async bulkDeleteOrganizationCustomDomain({
    organizationId,
    domains,
  }: {
    organizationId: string
    domains: CustomDomainBulkDeleteItemRequest[]
  }) {
    const response = await organizationCustomDomainApi.bulkDeleteOrganizationCustomDomain(organizationId, domains)
    return response.data
  },
  async validateEnvironmentCustomDomain({
    environmentId,
    payload,
  }: {
    environmentId: string
    payload: CustomDomainValidationRequest
  }) {
    const response = await environmentCustomDomainApi.validateEnvironmentCustomDomain(environmentId, payload)
    return response.data.errors
  },
  async createCustomDomain({
    serviceId,
    serviceType,
    payload,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    payload: CustomDomainRequest
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', () => ({
        mutation: customDomainApplicationApi.createApplicationCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', () => ({
        mutation: customDomainContainerApi.createContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', () => ({
        mutation: customDomainHelmApi.createHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, payload)
    return response.data
  },
  async editCustomDomain({
    serviceId,
    serviceType,
    customDomainId,
    payload,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    customDomainId: string
    payload: CustomDomainRequest
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', () => ({
        mutation: customDomainApplicationApi.editCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', () => ({
        mutation: customDomainContainerApi.editContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', () => ({
        mutation: customDomainHelmApi.editHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, customDomainId, payload)
    return response.data
  },
  async deleteCustomDomain({
    serviceId,
    serviceType,
    customDomainId,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
    customDomainId: string
  }) {
    const { mutation } = match(serviceType)
      .with('APPLICATION', (serviceType) => ({
        mutation: customDomainApplicationApi.deleteCustomDomain.bind(customDomainApplicationApi),
        serviceType,
      }))
      .with('CONTAINER', (serviceType) => ({
        mutation: customDomainContainerApi.deleteContainerCustomDomain.bind(customDomainContainerApi),
        serviceType,
      }))
      .with('HELM', (serviceType) => ({
        mutation: customDomainHelmApi.deleteHelmCustomDomain.bind(customDomainHelmApi),
        serviceType,
      }))
      .exhaustive()
    const response = await mutation(serviceId, customDomainId)
    return response.data
  },
}
