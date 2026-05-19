import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { isArgoCd } from '@qovery/domains/services/data-access'
import { ArgoCdManifest, useServiceSummary } from '@qovery/domains/services/feature'
import { ErrorBoundary, LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/manifest'
)({
  component: RouteComponent,
})

function ManifestLoader() {
  return (
    <div className="flex min-h-page-container flex-1 items-center justify-center bg-background">
      <LoaderSpinner />
    </div>
  )
}

function ManifestRouteContent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useServiceSummary({
    environmentId,
    serviceId,
    enabled: Boolean(environmentId) && Boolean(serviceId),
    suspense: true,
  })

  useDocumentTitle('Service - Manifest')

  if (!service || !isArgoCd(service)) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  return <ArgoCdManifest />
}

function RouteComponent() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ManifestLoader />}>
        <ManifestRouteContent />
      </Suspense>
    </ErrorBoundary>
  )
}
