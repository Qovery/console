import { createFileRoute, redirect } from '@tanstack/react-router'

// Connecting an agent is a popup now, opened from the Skills registry. Kept so old links still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/connect')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/skill-presets',
      params: { organizationId },
      search: (previous) => ({ ...previous, connect: true }),
      hash: true,
      replace: true,
    })
  },
})
