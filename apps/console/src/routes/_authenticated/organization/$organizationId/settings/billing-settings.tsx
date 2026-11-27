import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-settings')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/organization/$organizationId/settings/billing',
      params,
      search: true,
      hash: true,
      replace: true,
    })
  },
})
