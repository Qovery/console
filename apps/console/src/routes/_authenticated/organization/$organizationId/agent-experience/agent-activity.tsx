import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { AGENT_ACTIVITY_FLAG, AgentActivity, activitySearchSchema } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/agent-activity')({
  validateSearch: activitySearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = Route.useParams()
  const enabled = useFeatureFlagEnabled(AGENT_ACTIVITY_FLAG)

  if (enabled === undefined) return null
  if (!enabled) {
    return (
      <Navigate to="/organization/$organizationId/agent-experience/skill-presets" params={{ organizationId }} replace />
    )
  }

  return <AgentActivity />
}
