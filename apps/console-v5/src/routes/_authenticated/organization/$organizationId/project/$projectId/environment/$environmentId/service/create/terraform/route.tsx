import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { TerraformCreationFlow } from '@qovery/domains/service-terraform/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/terraform`

  return (
    <TerraformCreationFlow creationFlowUrl={creationFlowUrl}>
      <Outlet />
    </TerraformCreationFlow>
  )
}
