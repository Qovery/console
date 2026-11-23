import { createFileRoute, redirect } from '@tanstack/react-router'

// Connecting an agent is a popup in the Skills registry. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skills')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets',
      params: { organizationId },
      search: { connect: true },
      replace: true,
    })
  },
})
