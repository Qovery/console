import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ApplicationContainerStepResources } from '@qovery/domains/services/feature'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/resources'
)({
  component: Resources,
  validateSearch: serviceCreateParamsSchema,
})

function Resources() {
  const { organizationId, projectId, environmentId, slug } = Route.useParams()
  const navigate = useNavigate()
  const search = Route.useSearch()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('Resources - Create Service')

  const handleSubmit = (_data: ApplicationResourcesData) => {
    navigate({ to: `${creationFlowUrl}/ports`, search })
  }

  return <ApplicationContainerStepResources onSubmit={handleSubmit} />
}
