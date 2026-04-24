import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ApplicationContainerStepHealthchecks } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/health-checks'
)({
  component: Healthchecks,
  validateSearch: serviceCreateParamsSchema,
})

function Healthchecks() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('Health checks - Create Service')

  const handleBack = () => {
    navigate({ to: `${creationFlowUrl}/ports`, search })
  }

  const handleSubmit = async () => {
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
      <ApplicationContainerStepHealthchecks onBack={handleBack} onSubmit={handleSubmit} />
    </Suspense>
  )
}
