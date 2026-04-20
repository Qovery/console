import { Navigate, createFileRoute } from '@tanstack/react-router'
import { getLocalStorageStepIntroduction } from '@qovery/domains/service-job/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()

  const displayIntroductionView = !getLocalStorageStepIntroduction()

  const baseUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/lifecycle-job`
  const url = displayIntroductionView ? `${baseUrl}/introduction` : `${baseUrl}/general`

  return <Navigate to={url} params={{ organizationId, projectId, environmentId }} replace />
}
