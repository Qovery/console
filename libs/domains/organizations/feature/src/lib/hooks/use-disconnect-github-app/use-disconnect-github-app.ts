import { useAuth0 } from '@auth0/auth0-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDisconnectGithubApp() {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

  return useMutation(mutations.disconnectGithubApp, {
    async onSuccess(_, { organizationId }) {
      await getAccessTokenSilently({ cacheMode: 'off' })

      queryClient.invalidateQueries({
        queryKey: queries.organizations.authProviders({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Github App disconnected successfully',
      },
      notifyOnError: true,
    },
  })
}

export default useDisconnectGithubApp
