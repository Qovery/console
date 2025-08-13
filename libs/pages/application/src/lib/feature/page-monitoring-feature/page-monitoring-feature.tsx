import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceOverview } from '@qovery/domains/observability/feature'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageMonitoringFeature() {
  const { applicationId = '', environmentId = '' } = useParams()

  const isServiceObsEnabled = useFeatureFlagVariantKey('service-obs')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: serviceStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: cluster } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

  useDocumentTitle('Monitoring - Qovery')

  const hasMetrics = useMemo(
    () =>
      (isServiceObsEnabled &&
        cluster?.metrics_parameters?.enabled &&
        match(service?.serviceType)
          .with('APPLICATION', 'CONTAINER', () => true)
          .otherwise(() => false)) ||
      false,
    [isServiceObsEnabled, cluster?.metrics_parameters?.enabled, service?.serviceType]
  )

  const noMetricsAvailable = useMemo(
    () => serviceStatus?.state === 'STOPPED' || serviceStatus?.state === 'READY',
    [serviceStatus?.state]
  )

  if (!hasMetrics) return null

  return noMetricsAvailable ? (
    <div className="px-10 py-7">
      <div className="flex flex-col items-center gap-1 rounded border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
        <Icon className="text-md text-neutral-300" iconStyle="regular" iconName="circle-question" />
        <span className="font-medium">Monitoring is not available</span>
        <span>Deploy this service to view monitoring data</span>
      </div>
    </div>
  ) : (
    <ServiceOverview />
  )
}

export default PageMonitoringFeature
