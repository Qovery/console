import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agents. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skill-presets/')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/skill-presets',
      params: { organizationId },
      replace: true,
    })
  },
})
