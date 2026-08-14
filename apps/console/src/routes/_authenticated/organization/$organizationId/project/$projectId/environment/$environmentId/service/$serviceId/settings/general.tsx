import { createFileRoute } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { AgenticWorkflowSettings, ServiceGeneralSettings } from '@qovery/domains/service-settings/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, environmentId, serviceId } = Route.useParams()
  const { data: organization } = useOrganization({ organizationId, suspense: true })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (service && isAgenticWorkflow(service)) return <AgenticWorkflowSettings page="general" />

  if (!organization) return null

  return <ServiceGeneralSettings organization={organization} />
}
