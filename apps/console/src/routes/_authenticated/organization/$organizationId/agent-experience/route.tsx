import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience')({
  beforeLoad: ({ location }) => {
    const pathname = location.pathname
      .replace(/^(\/organization\/[^/]+)\/agent-experience(?=\/|$)/, '$1/agents')
      .replace(/^(\/organization\/[^/]+\/agents)\/automate\/?$/, '$1/automations')
    const hash = location.hash ? `#${location.hash}` : ''

    throw redirect({ href: `${pathname}${location.searchStr}${hash}`, replace: true })
  },
})
