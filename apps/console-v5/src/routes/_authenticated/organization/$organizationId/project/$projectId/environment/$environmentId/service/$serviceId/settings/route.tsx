import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ServiceSettingsLayout } from '@qovery/domains/service-settings/feature'
import { ErrorBoundary, LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings'
)({
  component: RouteComponent,
})

const OutletLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

function RouteComponent() {
  return (
    <Suspense fallback={<OutletLoader />}>
      <ErrorBoundary>
        <RouteContent />
      </ErrorBoundary>
    </Suspense>
  )
}

function RouteContent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()

  return (
    <ServiceSettingsLayout
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      serviceId={serviceId}
    >
      <Outlet />
    </ServiceSettingsLayout>
  )
}
