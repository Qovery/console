import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateQoveryMcpServer() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createQoveryMcpServer, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.mcpServers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Qovery MCP has been created',
      },
      notifyOnError: true,
    },
  })
}
