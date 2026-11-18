import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/preview'
)({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/organization/$organizationId/agent-experience/skill-presets', params })
  },
})
