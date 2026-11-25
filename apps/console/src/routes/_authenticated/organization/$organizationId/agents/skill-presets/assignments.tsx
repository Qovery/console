import { createFileRoute, redirect } from '@tanstack/react-router'

// The Skills registry is one page now. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/skill-presets/assignments')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/skill-presets',
      params: { organizationId },
      search: true,
      hash: true,
      replace: true,
    })
  },
})
