import { type Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ClusterEksSettings, useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, Section } from '@qovery/shared/ui'

export const handleSubmit = (data: FieldValues, cluster: Cluster) => {
  return {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
    production: data['production'],
  }
}

export function PageSettingsEKSAnywhereFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
    defaultValues: cluster,
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

  useEffect(() => {
    if (cluster) {
      methods.reset(cluster)
    }
  }, [cluster, methods])

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <SettingsHeading title="EKS Anywhere configuration" />
          <form onSubmit={onSubmit}>
            <div className="space-y-10">
              <ClusterEksSettings />
              <div className="flex justify-end">
                <Button
                  data-testid="submit-button"
                  type="submit"
                  size="lg"
                  loading={isEditClusterLoading}
                  disabled={!methods.formState.isValid}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </div>
    </FormProvider>
  )
}
