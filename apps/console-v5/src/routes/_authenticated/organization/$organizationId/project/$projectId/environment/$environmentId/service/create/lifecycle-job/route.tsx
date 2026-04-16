import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { JobCreationFlow } from '@qovery/domains/service-job/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/lifecycle-job`

  return (
    <JobCreationFlow creationFlowUrl={creationFlowUrl}>
      <Outlet />
    </JobCreationFlow>
  )
}
