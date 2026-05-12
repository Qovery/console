import { Navigate, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ServiceSettingsLayout } from '@qovery/domains/service-settings/feature'
import { isEditableService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
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
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!service) {
    return null
  }

  if (!isEditableService(service)) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  return (
    <ServiceSettingsLayout>
      <Outlet />
    </ServiceSettingsLayout>
  )
}
