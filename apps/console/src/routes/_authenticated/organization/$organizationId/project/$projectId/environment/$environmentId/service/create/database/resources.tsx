import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  type DatabaseCreateResourcesData,
  DatabaseStepResources,
  useDatabaseCreateContext,
} from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database/resources'
)({
  component: Resources,
  validateSearch: serviceCreateParamsSchema,
})

function Resources() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { generalForm } = useDatabaseCreateContext()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/database`
  const generalValues = generalForm.getValues()

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const cloudProvider = environment?.cloud_provider.provider as CloudProviderEnum | undefined

  useDocumentTitle('Resources - Create Database')

  const handleSubmit = (_data: DatabaseCreateResourcesData) => {
    navigate({ to: `${creationFlowUrl}/summary`, search })
  }

  const handleBack = () => {
    navigate({ to: `${creationFlowUrl}/general`, search })
  }

  if (!generalValues.name || !generalValues.type || !generalValues.version) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database/general"
        params={{
          organizationId,
          projectId,
          environmentId,
        }}
        search={search}
        replace
      />
    )
  }

  return <DatabaseStepResources onBack={handleBack} onSubmit={handleSubmit} cloudProvider={cloudProvider} />
}
