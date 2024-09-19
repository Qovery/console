import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationCustomDomainApi,
  ContainerCustomDomainApi,
  type CustomDomainRequest,
  HelmCustomDomainApi,
} from 'qovery-typescript-axios'
import { type ServiceType } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'

const customDomainApplicationApi = new ApplicationCustomDomainApi()
const customDomainContainerApi = new ContainerCustomDomainApi()
const customDomainHelmApi = new HelmCustomDomainApi()

export const customDomains = createQueryKeys('customDomains', {
  customDomains: ({
    serviceId,
    serviceType,
  }: {
    serviceId: string
    serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>
  }) => ({
    queryKey: [serviceId],
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
