import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Suspense } from 'react'
import { AgentTaskPreviewEnvironments, useEnvironment } from '@qovery/domains/environments/feature'
import { EnvironmentAutomation, EnvironmentAutomationSkeleton } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation'
)({ component: RouteComponent })

function RouteComponent() {
  useDocumentTitle('Automations')
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
    <Suspense fallback={<EnvironmentAutomationSkeleton />}>
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
      previews={
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Loading clone environment previews"
              aria-busy="true"
              className="flex justify-center py-8"
            >
              <LoaderSpinner />
            </div>
          }
        >
          <AgentTaskPreviewEnvironments sourceEnvironmentName={environment.name} />
        </Suspense>
      }
    />
  )
}
