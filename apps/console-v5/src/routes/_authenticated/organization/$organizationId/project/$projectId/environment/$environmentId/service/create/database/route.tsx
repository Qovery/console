import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { DatabaseCreationFlow } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/database`

  return (
    <DatabaseCreationFlow creationFlowUrl={creationFlowUrl}>
      <Outlet />
    </DatabaseCreationFlow>
  )
}
