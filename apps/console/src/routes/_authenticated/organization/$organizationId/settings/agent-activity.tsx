import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agents. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agent-activity')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/agent-activity',
      params: { organizationId },
      replace: true,
    })
  },
})
