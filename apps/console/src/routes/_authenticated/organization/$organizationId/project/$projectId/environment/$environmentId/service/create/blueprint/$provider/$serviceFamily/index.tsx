import { createFileRoute } from '@tanstack/react-router'
import { BlueprintConfigurationStep } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { serviceFamily } = Route.useParams()

  useDocumentTitle(`${serviceFamily} configuration`)

  return <BlueprintConfigurationStep />
}
