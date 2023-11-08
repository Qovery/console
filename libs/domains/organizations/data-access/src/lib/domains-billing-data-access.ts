import { BillingApi } from 'qovery-typescript-axios'

const billingApi = new BillingApi()

export const billing = {
  billingInfo: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const result = await billingApi.getOrganizationBillingInfo(organizationId)
      return result.data
    },
  }),
}

export const mutations = {}
