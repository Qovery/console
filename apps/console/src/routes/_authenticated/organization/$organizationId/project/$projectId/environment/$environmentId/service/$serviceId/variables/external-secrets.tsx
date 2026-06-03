import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { getServiceVariableScope, useRedeployServiceAction, useService } from '@qovery/domains/services/feature'
import { ExternalSecretsTab } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  useDocumentTitle('External secrets - Service')

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
  const redeployServiceAction = useRedeployServiceAction(service?.serviceType)
  const scope = getServiceVariableScope(service?.serviceType)

  if (!scope) {
    return null
  }

  const onCreateSecret = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your service for your changes to be applied.',
      redeployServiceAction,
      'Redeploy'
    )

  const onEditSecret = () =>
    toast(
      'success',
      'Edition success',
      'You need to redeploy your service for your changes to be applied.',
      redeployServiceAction,
      'Redeploy'
    )

  const onDeleteSecret = () =>
    toast(
      'success',
      'Deletion success',
      'You need to redeploy your service for your changes to be applied.',
      redeployServiceAction,
      'Redeploy'
    )

  return (
    <ExternalSecretsTab
      scope={scope}
      parentId={serviceId}
      onCreateSecret={onCreateSecret}
      onEditSecret={onEditSecret}
      onDeleteSecret={onDeleteSecret}
    />
  )
}
