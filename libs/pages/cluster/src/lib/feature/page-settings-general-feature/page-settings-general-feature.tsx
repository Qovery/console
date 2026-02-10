import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Cluster, type ClusterLabelsGroupList } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, cluster: Cluster) => {
  const baseCluster = {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
    production: data['production'],
  }

  // Add labels_groups for AWS non-production clusters (non-production is temporary)
  if (cluster.cloud_provider === 'AWS' && !data['production']) {
    return {
      ...baseCluster,
      labels_groups:
        data['labels_groups'] && data['labels_groups'].length > 0
          ? (data['labels_groups'].map((groupId: string) => ({ id: groupId })) as unknown as ClusterLabelsGroupList)
          : ([] as unknown as ClusterLabelsGroupList),
    }
  }

  const { labels_groups, ...baseClusterWithoutLabels } = baseCluster
  return baseClusterWithoutLabels
}

export function SettingsGeneralFeature({ cluster, organizationId }: { cluster: Cluster; organizationId: string }) {
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { isQoveryAdminUser } = useUserRole()
  const isKedaFeatureEnabled = useFeatureFlagVariantKey('keda')

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ...cluster,
      labels_groups: ((cluster.labels_groups as unknown as Array<{ id: string }> | undefined) || []).map(
        (group) => group.id
      ),
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      const cloneCluster = handleSubmit(data, cluster)

      if (isQoveryAdminUser) {
        if (data.metrics_parameters?.enabled) {
          cloneCluster.metrics_parameters = {
            enabled: data.metrics_parameters?.enabled ?? false,
            configuration: {
              kind: 'MANAGED_BY_QOVERY',
              resource_profile: cloneCluster.metrics_parameters?.configuration?.resource_profile,
              cloud_watch_export_config: {
                ...cloneCluster.metrics_parameters?.configuration?.cloud_watch_export_config,
                enabled: data.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled ?? false,
              },
              high_availability: cloneCluster.metrics_parameters?.configuration?.high_availability,
              internal_network_monitoring: cloneCluster.metrics_parameters?.configuration?.internal_network_monitoring,
              alerting: {
                ...cloneCluster.metrics_parameters?.configuration?.alerting,
                enabled: data.metrics_parameters?.configuration?.alerting?.enabled ?? false,
              },
            },
          }
        } else {
          cloneCluster.metrics_parameters = {
            enabled: false,
          }
        }
      }

      if (isKedaFeatureEnabled) {
        cloneCluster.keda = {
          enabled: Boolean(data.keda?.enabled),
        }
      }

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
