import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type ClusterFeatureAwsExistingVpc } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment, useListDatabaseConfigurations } from '@qovery/domains/environments/feature'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { type DatabaseCreateGeneralData, DatabaseStepGeneral } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database/general'
)({
  component: General,
  validateSearch: serviceCreateParamsSchema,
})

function General() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center py-8">
          <LoaderSpinner />
        </div>
      }
    >
      <GeneralContent />
    </Suspense>
  )
}

function GeneralContent() {
  useDocumentTitle('General - Create Database')

  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/database`

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    enabled: Boolean(environment?.cluster_id),
    suspense: true,
  })
  const { data: databaseConfigurations } = useListDatabaseConfigurations({
    environmentId,
    enabled: Boolean(environmentId),
    suspense: true,
  })
  const clusterVpc = cluster?.features?.find((feature) => feature.id === 'EXISTING_VPC')?.value_object?.value as
    | ClusterFeatureAwsExistingVpc
    | undefined

  const handleSubmit = (_data: DatabaseCreateGeneralData) => {
    navigate({ to: `${creationFlowUrl}/resources`, search })
  }

  return (
    <DatabaseStepGeneral
      onSubmit={handleSubmit}
      labelSetting={<LabelSetting />}
      annotationSetting={<AnnotationSetting />}
      cloudProvider={environment?.cloud_provider.provider}
      cluster={cluster}
      clusterVpc={clusterVpc}
      databaseConfigurations={databaseConfigurations}
    />
  )
}
