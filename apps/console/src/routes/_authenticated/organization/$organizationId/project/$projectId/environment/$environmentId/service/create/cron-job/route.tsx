import { Outlet, createFileRoute } from '@tanstack/react-router'
import { JobCreationFlow } from '@qovery/domains/service-job/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/cron-job`

  return (
    <JobCreationFlow creationFlowUrl={creationFlowUrl}>
      <Outlet />
    </JobCreationFlow>
  )
}
