import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ClusterCredentials } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/cloud-providers/data-access'
import { queries } from '@qovery/state/util-queries'

const ON_PREMISE_CREDENTIAL_NAME = 'On-premise clusters'

export function useEnsureOnPremiseCredential() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ organizationId }: { organizationId: string }): Promise<ClusterCredentials> => {
      const credentialsQuery = queries.cloudProviders.credentials({ organizationId, cloudProvider: 'ON_PREMISE' })
      // Always read the API: a credential created by a previous attempt must be found, not created again.
      const [existingCredential] = (await queryClient.fetchQuery({ ...credentialsQuery, staleTime: 0 })) ?? []
      if (existingCredential) return existingCredential

      const credential = await mutations.createCloudProviderCredential({
        organizationId,
        cloudProvider: 'ON_PREMISE',
        payload: { name: ON_PREMISE_CREDENTIAL_NAME },
      })
      queryClient.invalidateQueries({ queryKey: credentialsQuery.queryKey })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
      })
      return credential
    },
    {
      meta: {
        notifyOnError: true,
      },
    }
  )
}

export default useEnsureOnPremiseCredential
