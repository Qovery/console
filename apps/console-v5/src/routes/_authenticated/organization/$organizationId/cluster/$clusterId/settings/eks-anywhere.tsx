import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ClusterEksSettings, useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, LoaderSpinner, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/eks-anywhere'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
    defaultValues: cluster,
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && cluster) {
      try {
        await editCluster({
          organizationId,
          clusterId: cluster.id,
          clusterRequest: {
            ...cluster,
            ...data,
          },
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

  if (isClusterLoading) {
    return (
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <div className="flex items-start justify-center p-10">
            <LoaderSpinner className="w-5" />
          </div>
        </Section>
      </div>
    )
  }

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
