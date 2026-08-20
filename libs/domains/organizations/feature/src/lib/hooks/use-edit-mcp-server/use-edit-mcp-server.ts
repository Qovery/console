import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditMcpServer() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editMcpServer, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.mcpServers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your MCP connector has been updated',
      },
      notifyOnError: true,
    },
  })
}
