import { createFileRoute, redirect } from '@tanstack/react-router'

// Usage now lives in Activity. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/skill-presets/usage')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/agent-activity',
      params: { organizationId },
      replace: true,
    })
  },
})
