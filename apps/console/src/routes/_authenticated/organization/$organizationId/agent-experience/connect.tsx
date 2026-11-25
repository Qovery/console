import { createFileRoute, redirect } from '@tanstack/react-router'

// Connecting an agent is a popup now, opened from the Skills registry. Kept so old links still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/connect')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets',
      params: { organizationId },
      search: { connect: true },
      replace: true,
    })
  },
})
