import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useLocalStorage } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/agents')({
  component: AgentsRedirect,
})

function AgentsRedirect() {
  const { data: organizations = [] } = useOrganizations({ suspense: true })
  const [currentOrganizationId = ''] = useLocalStorage<string>('currentOrganizationId', '')
  const organization = organizations.find(({ id }) => id === currentOrganizationId) ?? organizations[0]

  if (!organization) {
    return null
  }

  return <Navigate to="/organization/$organizationId/agents" params={{ organizationId: organization.id }} replace />
}
