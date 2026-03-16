import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ApplicationContainerStepVariables,
  useApplicationContainerCreateContext,
} from '@qovery/domains/services/feature'
import { applicationContainerCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/variables'
)({
  component: Variables,
  validateSearch: applicationContainerCreateParamsSchema,
})

function Variables() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { portForm } = useApplicationContainerCreateContext()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('Environment variables - Create Service')

  const handleBack = () => {
    const hasPorts = Boolean(portForm.getValues('ports')?.length)
    navigate({ to: `${creationFlowUrl}/${hasPorts ? 'health-checks' : 'ports'}`, search })
  }

  const handleSubmit = () => {
    navigate({ to: `${creationFlowUrl}/summary`, search })
  }

  return <ApplicationContainerStepVariables onBack={handleBack} onSubmit={handleSubmit} />
}
