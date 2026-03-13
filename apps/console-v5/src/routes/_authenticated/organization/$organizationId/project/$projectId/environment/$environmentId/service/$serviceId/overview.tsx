import { createFileRoute, useParams } from '@tanstack/react-router'
import { memo, useContext, useMemo } from 'react'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { EnableObservabilityModal } from '@qovery/domains/observability/feature'
import { TerraformResourcesSection } from '@qovery/domains/service-terraform/feature'
import {
  ObservabilityCallout,
  ServiceOverview,
  ServiceTerminal,
  ServiceTerminalContext,
  ServiceTerminalProvider,
} from '@qovery/domains/services/feature'
import { useService } from '@qovery/domains/services/feature'
import { serviceOverviewParamsSchema } from '@qovery/shared/router'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview'
)({
  component: RouteComponent,
  validateSearch: serviceOverviewParamsSchema,
})

const WebSocketListenerMemo = memo(MetricsWebSocketListener)
const ServiceTerminalMemo = memo(ServiceTerminal)

function RouteComponentContent() {
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { open, setOpen } = useContext(ServiceTerminalContext)

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '', suspense: true })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

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

  const shellAction = useMemo(() => {
    if (!service) return undefined

    return match(service)
      .with({ serviceType: 'DATABASE' }, (s) => (s.mode === 'CONTAINER' ? () => setOpen(true) : undefined))
      .with(
        { serviceType: 'APPLICATION' },
        { serviceType: 'CONTAINER' },
        { serviceType: 'JOB' },
        () => () => setOpen(true)
      )
      .otherwise(() => undefined)
  }, [service, setOpen])

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
        shellAction={shellAction}
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
      {open && environment && service && (
        <ServiceTerminalMemo
          organizationId={environment.organization.id}
          clusterId={environment.cluster_id}
          projectId={environment.project.id}
          environmentId={environment.id}
          serviceId={service.id}
        />
      )}
    </>
  )
}

function RouteComponent() {
  return (
    <ServiceTerminalProvider>
      <RouteComponentContent />
    </ServiceTerminalProvider>
  )
}
