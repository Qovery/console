import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceOverview } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'

export function PageMonitoringFeature() {
  const { applicationId = '', environmentId = '' } = useParams()

  const isServiceObsEnabled = useFeatureFlagVariantKey('service-obs')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: cluster } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

  const hasMetrics =
    (isServiceObsEnabled &&
      cluster?.metrics_parameters?.enabled &&
      match(service?.serviceType)
        .with('APPLICATION', 'CONTAINER', () => true)
        .otherwise(() => false)) ||
    false

  if (!hasMetrics) return null

  return (
    <div className="px-10 py-7">
      <ServiceOverview />
    </div>
  )
}

export default PageMonitoringFeature
