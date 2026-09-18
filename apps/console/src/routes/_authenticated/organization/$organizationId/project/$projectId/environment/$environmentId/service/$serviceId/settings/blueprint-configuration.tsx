import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { BlueprintGeneralSettings } from '@qovery/domains/service-settings/feature'
import { isBlueprintService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/blueprint-configuration'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const { data: organization } = useOrganization({ organizationId, suspense: true })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  useDocumentTitle('Blueprint configuration - Service settings')

  if (!service) {
    return null
  }

  if (!isBlueprintService(service)) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  if (!organization) {
    return null
  }

  return <BlueprintGeneralSettings service={service} environmentId={environmentId} organizationId={organization.id} />
}
