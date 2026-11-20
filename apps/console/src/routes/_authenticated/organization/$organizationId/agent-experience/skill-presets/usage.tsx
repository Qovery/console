import { createFileRoute, redirect } from '@tanstack/react-router'

// Usage now lives in Activity. Kept so old links and bookmarks still work.
export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/usage'
)({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/agent-activity',
      params: { organizationId },
      replace: true,
    })
  },
})
