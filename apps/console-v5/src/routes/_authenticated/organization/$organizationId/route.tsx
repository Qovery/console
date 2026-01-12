import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId')({
  component: RouteComponent,
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
