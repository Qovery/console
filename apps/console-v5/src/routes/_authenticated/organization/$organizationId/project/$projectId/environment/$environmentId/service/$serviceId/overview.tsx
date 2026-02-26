import { createFileRoute, useParams } from '@tanstack/react-router'
import { memo, useMemo } from 'react'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { EnableObservabilityModal } from '@qovery/domains/observability/feature'
import { TerraformResourcesSection } from '@qovery/domains/service-terraform/feature'
import { ObservabilityCallout, ServiceOverview } from '@qovery/domains/services/feature'
import { useService } from '@qovery/domains/services/feature'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview'
)({
  component: RouteComponent,
})

const WebSocketListenerMemo = memo(MetricsWebSocketListener)

function RouteComponent() {
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId })
  const { data: environment } = useEnvironment({ environmentId })
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
    <>
      <ServiceOverview
        environment={environment}
        terraformResourcesSection={serviceId ? <TerraformResourcesSection terraformId={serviceId} /> : undefined}
        hasNoMetrics={hasNoMetrics}
        observabilityCallout={
          <ObservabilityCallout>
            <EnableObservabilityModal />
          </ObservabilityCallout>
        }
      />
      {environment && service?.serviceType && (
        <WebSocketListenerMemo
          organizationId={environment.organization.id}
          clusterId={environment.cluster_id}
          projectId={environment.project.id}
          environmentId={environment.id}
          serviceId={serviceId}
          serviceType={service?.serviceType}
        />
      )}
    </>
  )
}
