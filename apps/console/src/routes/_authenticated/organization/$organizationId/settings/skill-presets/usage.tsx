import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skill-presets/usage')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/agent-activity',
      params: { organizationId },
      search: true,
      hash: true,
      replace: true,
    })
  },
})
