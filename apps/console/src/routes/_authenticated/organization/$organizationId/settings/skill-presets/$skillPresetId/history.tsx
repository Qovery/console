import { createFileRoute, redirect } from '@tanstack/react-router'

// Moved to Agents. Kept so old links and bookmarks still work.
export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/settings/skill-presets/$skillPresetId/history'
)({
  beforeLoad: ({ params: { organizationId, skillPresetId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/skill-presets/$skillPresetId/history',
      params: { organizationId, skillPresetId },
      search: true,
      hash: true,
      replace: true,
    })
  },
})
