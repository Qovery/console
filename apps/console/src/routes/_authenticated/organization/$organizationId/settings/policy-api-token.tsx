import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/policy-api-token')({
  beforeLoad: ({ params: { organizationId } }) => {
    throw redirect({
      to: '/organization/$organizationId/agents/policy-tokens',
      params: { organizationId },
      search: true,
      hash: true,
      replace: true,
    })
  },
})
