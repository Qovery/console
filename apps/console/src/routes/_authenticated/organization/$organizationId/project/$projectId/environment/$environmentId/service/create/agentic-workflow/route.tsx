import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect } from 'react'
import { AgenticWorkflowCreationFlow, getAgenticWorkflowTemplate } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const { template } = Route.useSearch()
  const selectedTemplate = getAgenticWorkflowTemplate(template)
  const navigate = useNavigate()
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
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
      seed={selectedTemplate?.seed}
      variablesSeed={selectedTemplate?.variables}
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
