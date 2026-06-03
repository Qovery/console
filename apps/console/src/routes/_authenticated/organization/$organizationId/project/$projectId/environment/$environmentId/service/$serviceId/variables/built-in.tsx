import { createFileRoute } from '@tanstack/react-router'
import { ServiceVariablesBuiltInTab } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/built-in'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Built-in variables - Service')

  return <ServiceVariablesBuiltInTab />
}
