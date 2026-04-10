import { createFileRoute } from '@tanstack/react-router'
import { ApplicationContainerStorageSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/storage'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Storage - Service settings')

  return <ApplicationContainerStorageSettings />
}
