import { createFileRoute, redirect } from '@tanstack/react-router'

// The Agents tab lands on the Skills registry. Setup guidance lives on the organization overview.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets',
      params: { organizationId },
      replace: true,
    })
  },
})
