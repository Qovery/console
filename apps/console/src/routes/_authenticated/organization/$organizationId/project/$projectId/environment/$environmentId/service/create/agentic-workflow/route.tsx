import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect } from 'react'
import { AgenticWorkflowCreationFlow } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const navigate = useNavigate()
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/agentic-workflow`

  useEffect(() => {
    if (!isAgenticWorkflowEnabled) {
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
        params: { organizationId, projectId, environmentId },
      })
    }
  }, [environmentId, isAgenticWorkflowEnabled, navigate, organizationId, projectId])

  if (!isAgenticWorkflowEnabled) return null

  return (
    <AgenticWorkflowCreationFlow
      creationFlowUrl={creationFlowUrl}
      onExit={() =>
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
          params: { organizationId, projectId, environmentId },
        })
      }
    >
      <Outlet />
    </AgenticWorkflowCreationFlow>
  )
}
