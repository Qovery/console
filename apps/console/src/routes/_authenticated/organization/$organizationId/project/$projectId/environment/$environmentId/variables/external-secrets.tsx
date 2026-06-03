import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { ExternalSecretsTab } from '@qovery/domains/variables/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  useDocumentTitle('External secrets - Environment')

  if (!secretManagerEnabled) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/variables"
        params={{ organizationId, projectId, environmentId }}
        replace
      />
    )
  }

  return <ExternalSecretsTab scope="ENVIRONMENT" parentId={environmentId} />
}
