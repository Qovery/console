import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skills')({
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
