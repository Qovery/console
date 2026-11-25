import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/skill-presets/preview')({
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
