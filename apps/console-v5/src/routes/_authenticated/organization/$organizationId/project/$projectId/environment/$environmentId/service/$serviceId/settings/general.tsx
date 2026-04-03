import { createFileRoute } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { ServiceGeneralSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = Route.useParams()
  const { data: organization } = useOrganization({ organizationId, suspense: true })

  if (!organization) return null

  return <ServiceGeneralSettings organization={organization} />
}
