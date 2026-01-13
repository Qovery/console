import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { LoaderSpinner } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/_authenticated/organization/$organizationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { organizationId } = params
    // Preload data (organization and clusters) without waiting for the queries to complete
    context.queryClient.prefetchQuery({
      ...queries.organizations.details({ organizationId }),
    })
    context.queryClient.prefetchQuery({
      ...queries.clusters.list({ organizationId }),
    })
  },
})

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderSpinner />
    </div>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  )
}
