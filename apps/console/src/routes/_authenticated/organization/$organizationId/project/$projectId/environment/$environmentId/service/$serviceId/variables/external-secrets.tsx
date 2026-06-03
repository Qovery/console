import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { getServiceVariableScope, useService } from '@qovery/domains/services/feature'
import { ExternalSecretsTab } from '@qovery/domains/variables/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')

  if (!secretManagerEnabled) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  return <ExternalSecretsRouteContent environmentId={environmentId} serviceId={serviceId} />
}

function ExternalSecretsRouteContent({ environmentId, serviceId }: { environmentId: string; serviceId: string }) {
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const scope = getServiceVariableScope(service?.serviceType)

  if (!scope) {
    return null
  }

  return <ExternalSecretsTab scope={scope} parentId={serviceId} />
}
