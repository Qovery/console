import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Suspense } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { EnvironmentAutomation, ServiceListSkeleton } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation'
)({ component: RouteComponent })

function RouteComponent() {
  useDocumentTitle('Automation')
  const params = Route.useParams()
  const enabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const { data: environment } = useEnvironment({ environmentId: params.environmentId, suspense: true })
  if (!enabled)
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
        params={params}
        replace
      />
    )
  if (!environment) return null
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <EnvironmentAutomation environment={environment} />
    </Suspense>
  )
}
