import { createFileRoute } from '@tanstack/react-router'
import { BlueprintManifestFieldsProvider, BlueprintSetupSection } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/blueprint-setup'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { serviceFamily } = Route.useParams()

  useDocumentTitle(`${serviceFamily} setup`)

  return (
    <BlueprintManifestFieldsProvider>
      <BlueprintSetupSection />
    </BlueprintManifestFieldsProvider>
  )
}
