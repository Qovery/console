import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense } from 'react'
import {
  ApplicationContainerStepPort,
  type ApplicationContainerStepPortSubmitData,
} from '@qovery/domains/services/feature'
import { applicationContainerCreateParamsSchema } from '@qovery/shared/router'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/ports'
)({
  component: Ports,
  validateSearch: applicationContainerCreateParamsSchema,
})

function Ports() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('Ports - Create Service')

  const handleBack = () => {
    navigate({ to: `${creationFlowUrl}/resources`, search })
  }

  const handleSubmit = async ({ portData }: ApplicationContainerStepPortSubmitData) => {
    if ((portData.ports?.length ?? 0) > 0) {
      navigate({ to: `${creationFlowUrl}/health-checks`, search })
      return
    }
    navigate({ to: `${creationFlowUrl}/variables`, search })
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center py-8">
          <LoaderSpinner />
        </div>
      }
    >
      <ApplicationContainerStepPort onBack={handleBack} onSubmit={handleSubmit} />
    </Suspense>
  )
}
