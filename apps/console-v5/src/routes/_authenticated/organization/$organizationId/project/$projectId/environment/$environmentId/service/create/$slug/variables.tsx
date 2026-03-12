import { createFileRoute } from '@tanstack/react-router'
import { ApplicationContainerStepVariables } from '@qovery/domains/services/feature'
import { applicationContainerCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/variables'
)({
  component: Variables,
  validateSearch: applicationContainerCreateParamsSchema,
})

function Variables() {
  useDocumentTitle('Environment variables - Create Service')

  return <ApplicationContainerStepVariables />
}
