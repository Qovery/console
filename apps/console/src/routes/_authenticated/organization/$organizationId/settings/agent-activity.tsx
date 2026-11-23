import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agent-activity')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/agent-activity',
      params: { organizationId },
      replace: true,
    })
  },
})
