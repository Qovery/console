import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agent Experience. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/ai-copilot')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/copilot',
      params: { organizationId },
      replace: true,
    })
  },
})
