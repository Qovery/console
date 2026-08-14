import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ServiceResourcesSettings } from '@qovery/domains/service-settings/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/resources'
)({
  component: RouteComponent,
})

const ResourcesLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

function RouteComponent() {
  const params = Route.useParams()
  const { environmentId, serviceId } = params
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  return (
    <Suspense fallback={<ResourcesLoader />}>
      {service && isAgenticWorkflow(service) ? (
        <Navigate
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general"
          params={params}
          replace
        />
      ) : (
        <ServiceResourcesSettings />
      )}
    </Suspense>
  )
}
