import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useConnectGithubApp() {
  const queryClient = useQueryClient()

  return useMutation(mutations.connectGithubApp, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.list.queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Github application connection success',
      },
      notifyOnError: true,
    },
  })
}

export default useConnectGithubApp
