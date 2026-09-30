import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Suspense } from 'react'
import { AgentTaskPreviewEnvironments, useEnvironment } from '@qovery/domains/environments/feature'
import { EnvironmentAutomation, ServiceListSkeleton } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation'
)({ component: RouteComponent })

function RouteComponent() {
  useDocumentTitle('Automation')
  const params = Route.useParams()
  const enabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  if (!enabled)
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
        params={params}
        replace
      />
    )
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <AutomationContent />
    </Suspense>
  )
}

function AutomationContent() {
  const { environmentId } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  if (!environment) return null
  return (
    <EnvironmentAutomation
      environment={environment}
      previews={<AgentTaskPreviewEnvironments sourceEnvironmentName={environment.name} />}
    />
  )
}
