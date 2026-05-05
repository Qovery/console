import { createFileRoute } from '@tanstack/react-router'
import { ServiceDomainSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/domain'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Domain - Service settings')

  return <ServiceDomainSettings />
}
