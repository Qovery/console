import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ServiceResourcesSettings } from '@qovery/domains/service-settings/feature'
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
  return (
    <Suspense fallback={<ResourcesLoader />}>
      <ServiceResourcesSettings />
    </Suspense>
  )
}
