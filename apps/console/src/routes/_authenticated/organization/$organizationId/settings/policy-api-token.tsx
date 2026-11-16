import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agents. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/policy-api-token')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/policy-tokens',
      params: { organizationId },
      replace: true,
    })
  },
})
