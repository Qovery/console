import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { TerraformCreationFlow } from '@qovery/domains/service-terraform/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
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
