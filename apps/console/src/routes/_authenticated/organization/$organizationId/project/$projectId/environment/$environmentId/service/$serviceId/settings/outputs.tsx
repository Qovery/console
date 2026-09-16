import { Navigate, createFileRoute } from '@tanstack/react-router'
import { AgenticWorkflowSettings } from '@qovery/domains/service-settings/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/outputs'
)({ component: OutputsRouteComponent })

export function OutputsRouteComponent() {
  const params = Route.useParams()
  const { environmentId, serviceId } = params
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!isAgenticWorkflow(service)) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general"
        params={params}
        replace
      />
    )
  }

  return <AgenticWorkflowSettings page="outputs" />
}
