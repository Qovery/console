import { createFileRoute, redirect } from '@tanstack/react-router'

// The Agents tab opens on the Skills Registry until the Overview lands.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets',
      params: { organizationId },
      replace: true,
    })
  },
})
