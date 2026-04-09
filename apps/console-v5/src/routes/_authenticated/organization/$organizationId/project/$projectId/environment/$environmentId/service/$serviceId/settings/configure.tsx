import { createFileRoute } from '@tanstack/react-router'
import { JobConfiguration } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/configure'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Job configuration - Service settings')

  return (
    <div className="px-8 pb-8 pt-6">
      <JobConfiguration />
    </div>
  )
}
