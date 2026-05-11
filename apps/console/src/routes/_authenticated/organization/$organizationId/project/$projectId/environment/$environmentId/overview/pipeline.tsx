import { createFileRoute } from '@tanstack/react-router'
import { ServicesDeploymentPipeline } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview/pipeline'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Deployment Pipeline')

  return <ServicesDeploymentPipeline />
}
