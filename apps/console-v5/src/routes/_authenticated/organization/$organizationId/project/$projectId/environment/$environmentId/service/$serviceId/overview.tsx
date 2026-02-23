import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { EnableObservabilityModal } from '@qovery/domains/observability/feature'
import { TerraformResourcesSection } from '@qovery/domains/service-terraform/feature'
import { ServiceOverviewFeature, useService } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const hasNoMetrics = useMemo(
    () =>
      (cluster?.cloud_provider === 'AWS' ||
        cluster?.cloud_provider === 'SCW' ||
        cluster?.cloud_provider === 'GCP' ||
        cluster?.cloud_provider === 'AZURE') &&
      !cluster?.metrics_parameters?.enabled &&
      match(service?.serviceType)
        .with('APPLICATION', 'CONTAINER', () => true)
        .otherwise(() => false),
    [cluster?.metrics_parameters?.enabled, service?.serviceType, cluster?.cloud_provider]
  )

  return (
    <ServiceOverviewFeature
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      serviceId={serviceId}
      service={service}
      environment={environment}
      hasNoMetrics={hasNoMetrics}
      terraformResourcesSection={serviceId ? <TerraformResourcesSection terraformId={serviceId} /> : undefined}
      observabilityCalloutModalContent={<EnableObservabilityModal />}
    />
  )
}
