import { memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import PageGeneral from '../../ui/page-general/page-general'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export function PageGeneralFeature() {
  const { applicationId = '', organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })
  const hasNoMetrics = useMemo(
    () =>
      cluster?.cloud_provider === 'AWS' ||
      (cluster?.cloud_provider === 'SCW' &&
        !cluster?.metrics_parameters?.enabled &&
        match(service?.serviceType)
          .with('APPLICATION', 'CONTAINER', () => true)
          .otherwise(() => false)),
    [cluster?.metrics_parameters?.enabled, service?.serviceType, cluster?.cloud_provider]
  )

  return (
    <>
      {Boolean(applicationId) && Boolean(environmentId) && (
        <PageGeneral
          serviceId={applicationId}
          environmentId={environmentId}
          isCronJob={service?.serviceType === 'JOB' && service.job_type === 'CRON'}
          isLifecycleJob={service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE'}
          hasNoMetrics={hasNoMetrics}
        />
      )}
      {service && environment && (
        <WebSocketListenerMemo
          organizationId={organizationId}
          clusterId={environment.cluster_id}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={applicationId}
          serviceType={service.serviceType}
        />
      )}
    </>
  )
}

export default PageGeneralFeature
