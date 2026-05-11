import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { ApplicationContainerCreationFlow } from '@qovery/domains/services/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  const defaultServiceType = slug === 'container' ? ServiceTypeEnum.CONTAINER : ServiceTypeEnum.APPLICATION

  return (
    <ApplicationContainerCreationFlow creationFlowUrl={creationFlowUrl} defaultServiceType={defaultServiceType}>
      <Outlet />
    </ApplicationContainerCreationFlow>
  )
}
