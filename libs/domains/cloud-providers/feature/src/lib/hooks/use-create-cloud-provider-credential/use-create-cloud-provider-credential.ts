import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { mutations } from '@qovery/domains/cloud-providers/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateCloudProviderCredential() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCloudProviderCredential, {
    onSuccess(credential, { organizationId, cloudProvider }) {
      if (credential) {
        posthog.capture('cloud-credentials-created', {
          organization_id: organizationId,
          cloud_provider: cloudProvider,
          $groups: { organization_id: organizationId },
        })
      }
      queryClient.invalidateQueries({
        queryKey: queries.cloudProviders.credentials({ organizationId, cloudProvider }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your credential has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCloudProviderCredential
