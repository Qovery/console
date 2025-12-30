import { createFileRoute, useParams } from '@tanstack/react-router'
import { type Cluster } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { ClusterGeneralSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { useUserRole } from '@qovery/shared/iam/feature'
import { BlockContent, Button, Callout, ExternalLink, Icon, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/general'
)({
  component: RouteComponent,
})

const handleSubmit = (data: FieldValues, cluster: Cluster) => {
  return {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
    production: data['production'],
  }
}

function ClusterGeneralSettingsForm({ cluster }: { cluster: Cluster }) {
  const { organizationId } = useParams({ strict: false })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { isQoveryAdminUser } = useUserRole()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: cluster,
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data) {
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

      editCluster({
        organizationId,
        clusterId: cluster.id,
        clusterRequest: cloneCluster,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading title="General settings" />
          {cluster.cloud_provider !== 'ON_PREMISE' && (
            <Callout.Root color="sky" className="mb-4">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
                <Callout.TextDescription>
                  Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                  <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                  drift in the configuration.
                  <br />
                  <ExternalLink
                    size="sm"
                    href="https://www.qovery.com/docs/configuration/clusters#faq"
                    className="mt-3"
                  >
                    Click here for more details
                  </ExternalLink>
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
          <form onSubmit={onSubmit}>
            <BlockContent title="General information">
              <ClusterGeneralSettings fromDetail />
            </BlockContent>
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
          </form>
        </Section>
      </div>
    </FormProvider>
  )
}

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })

  if (!cluster) {
    return null
  }

  return <ClusterGeneralSettingsForm cluster={cluster} />
}
