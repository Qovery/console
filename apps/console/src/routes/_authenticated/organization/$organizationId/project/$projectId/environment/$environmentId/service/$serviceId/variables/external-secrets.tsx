import { createFileRoute } from '@tanstack/react-router'
import { getServiceVariableScope, useService } from '@qovery/domains/services/feature'
import { ExternalSecretsTab } from '@qovery/domains/variables/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId, serviceId } = Route.useParams()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const scope = getServiceVariableScope(service?.serviceType)

  if (!scope) {
    return null
  }

  return <ExternalSecretsTab scope={scope} parentId={serviceId} />
}
