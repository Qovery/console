import { Navigate, createFileRoute } from '@tanstack/react-router'
import { getLocalStorageStepIntroduction } from '@qovery/domains/service-job/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()

  const displayIntroductionView = !getLocalStorageStepIntroduction()

  const baseUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/lifecycle-job`
  const step = displayIntroductionView ? 'introduction' : 'general'
  const url = `${baseUrl}/${step}`

  return <Navigate to={url} params={{ organizationId, projectId, environmentId }} replace search={search} />
}
