import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { AgentActivity, activitySearchSchema } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/agent-activity')({
  validateSearch: activitySearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = Route.useParams()
  const enabled = useFeatureFlagEnabled('agent-activity')

  if (enabled === undefined) return null
  if (!enabled) {
    return (
      <Navigate
        to="/organization/$organizationId/agents/skill-presets"
        params={{ organizationId }}
        search
        hash
        replace
      />
    )
  }

  return <AgentActivity />
}
