import { Navigate, createFileRoute } from '@tanstack/react-router'
import { HelmStepValuesOverrideFile, useHelmCreateContext } from '@qovery/domains/service-helm/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm/values-override-file'
)({
  component: ValuesOverrideFile,
  validateSearch: serviceCreateParamsSchema,
})

function ValuesOverrideFile() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()
  const { generalForm } = useHelmCreateContext()
  const generalValues = generalForm.getValues()

  useDocumentTitle('Values override as file - Create Helm')

  if (!generalValues.name || !generalValues.source_provider) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm/general"
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

  return <HelmStepValuesOverrideFile />
}
