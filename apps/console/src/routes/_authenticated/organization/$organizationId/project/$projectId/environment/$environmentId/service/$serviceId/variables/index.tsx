import { createFileRoute } from '@tanstack/react-router'
import { ServiceVariablesCustomTab } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Custom variables - Service')

  return <ServiceVariablesCustomTab />
}
