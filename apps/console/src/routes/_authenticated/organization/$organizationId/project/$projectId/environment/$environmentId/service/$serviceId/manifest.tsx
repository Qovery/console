import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/manifest'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Service - Manifest')

  return <div className="flex min-h-page-container flex-1 bg-background" />
}
