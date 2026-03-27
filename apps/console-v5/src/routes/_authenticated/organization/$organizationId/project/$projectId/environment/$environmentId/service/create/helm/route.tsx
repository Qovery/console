import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { HelmCreationFlow } from '@qovery/domains/service-helm/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/helm`

  return (
    <HelmCreationFlow creationFlowUrl={creationFlowUrl}>
      <Outlet />
    </HelmCreationFlow>
  )
}
