import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agent Experience. Kept so old links and bookmarks still work.
export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/settings/skill-presets/$skillPresetId/'
)({
  beforeLoad: ({ params: { organizationId, skillPresetId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId',
      params: { organizationId, skillPresetId },
      replace: true,
    })
  },
})
