import { type Cluster } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, cluster: Cluster) => {
  return {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
    production: data['production'],
  }
}

export function SettingsGeneralFeature({ cluster, organizationId }: { cluster: Cluster; organizationId: string }) {
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ...cluster,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      const cloneCluster = handleSubmit(data, cluster)

      editCluster({
        organizationId,
        clusterId: cluster.id,
        clusterRequest: cloneCluster,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral cluster={cluster} onSubmit={onSubmit} loading={isEditClusterLoading} />
    </FormProvider>
  )
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })

  return cluster && <SettingsGeneralFeature cluster={cluster} organizationId={organizationId} />
}

export default PageSettingsGeneralFeature
