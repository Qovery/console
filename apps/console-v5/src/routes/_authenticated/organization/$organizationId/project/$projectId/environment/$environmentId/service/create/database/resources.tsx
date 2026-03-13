import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CloudProviderEnum, type ManagedDatabaseInstanceTypeResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { useCloudProviderDatabaseInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  type DatabaseCreateResourcesData,
  DatabaseStepResources,
  useDatabaseCreateContext,
} from '@qovery/domains/services/feature'
import { type Value } from '@qovery/shared/interfaces'
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
  const databaseType = generalValues.type ?? 'POSTGRESQL'

  const { data: environment } = useEnvironment({ environmentId })
  const cloudProvider = environment?.cloud_provider.provider as CloudProviderEnum | undefined
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    enabled: Boolean(environment?.cluster_id),
  })
  const { data: databaseInstanceTypes } = useCloudProviderDatabaseInstanceTypes(
    match(cloudProvider ?? CloudProviderEnum.AWS)
      .with(CloudProviderEnum.AWS, (provider) => ({
        cloudProvider: provider,
        databaseType,
        region: cluster?.region || '',
      }))
      .with(CloudProviderEnum.SCW, (provider) => ({
        cloudProvider: provider,
        databaseType,
      }))
      .with(CloudProviderEnum.GCP, (provider) => ({
        cloudProvider: provider,
        databaseType,
      }))
      .otherwise(() => ({
        cloudProvider: CloudProviderEnum.ON_PREMISE,
        databaseType,
      }))
  )

  const instanceTypeOptions: Value[] =
    databaseInstanceTypes?.map((instanceType: ManagedDatabaseInstanceTypeResponse) => ({
      label: instanceType.name,
      value: instanceType.name,
    })) ?? []

  useDocumentTitle('Resources - Create Database')

  const handleSubmit = (_data: DatabaseCreateResourcesData) => {
    navigate({ to: `${creationFlowUrl}/summary`, search })
  }

  const handleBack = () => {
    navigate({ to: `${creationFlowUrl}/general`, search })
  }

  if (!generalValues.name || !generalValues.type || !generalValues.version || !generalValues.mode) {
    return <Navigate to={`${creationFlowUrl}/general`} search={search} replace />
  }

  return (
    <DatabaseStepResources
      onBack={handleBack}
      onSubmit={handleSubmit}
      cloudProvider={cloudProvider}
      instanceTypeOptions={instanceTypeOptions}
    />
  )
}
