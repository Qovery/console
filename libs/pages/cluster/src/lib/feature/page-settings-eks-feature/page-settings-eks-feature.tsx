import { type Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ClusterEksSettings, useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, LoaderSpinner, Section } from '@qovery/shared/ui'

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
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
    defaultValues: cluster,
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && cluster) {
      try {
        const cloneCluster = handleSubmit(data, cluster)

        await editCluster({
          organizationId,
          clusterId: cluster.id,
          clusterRequest: cloneCluster,
        })
      } catch (error) {
        console.error(error)
      }
    }
  })

  useEffect(() => {
    if (cluster && !isClusterLoading) {
      methods.reset(cluster)
    }
  }, [cluster, isClusterLoading, methods])

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <SettingsHeading title="EKS Anywhere configuration" />
          {isClusterLoading ? (
            <div className="flex items-start justify-center p-10">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
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
          )}
        </Section>
      </div>
    </FormProvider>
  )
}
