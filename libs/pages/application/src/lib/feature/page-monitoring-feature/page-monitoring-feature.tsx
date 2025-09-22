import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  EnableObservabilityButtonContactUs,
  EnableObservabilityContent,
  EnableObservabilityVideo,
  ServiceOverview,
} from '@qovery/domains/observability/feature'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PlaceholderMonitoring } from './placeholder-monitoring'

export function PageMonitoringFeature() {
  const { applicationId = '', environmentId = '' } = useParams()

  const isServiceObsEnabled = useFeatureFlagVariantKey('service-obs')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: serviceStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })
  const { data: service, isFetched: isServiceFetched } = useService({ environmentId, serviceId: applicationId })
  const { data: cluster, isFetched: isClusterFetched } = useCluster({
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

  if (!isClusterFetched || !isServiceFetched) return null

  if (!hasMetrics)
    return (
      <div className="flex flex-col">
        <div className="grid gap-32 p-8 pb-10 md:grid-cols-2">
          <div className="flex flex-col gap-8 md:min-w-[540px] 2xl:mt-10">
            <EnableObservabilityContent />
            <div className="flex items-center gap-4">
              <EnableObservabilityButtonContactUs size="lg" />
              <span className="font-semibold text-neutral-400">Starting from $299/month</span>
            </div>
          </div>
          <div className="relative left-4 flex h-full w-full items-center 2xl:left-0">
            <EnableObservabilityVideo />
          </div>
        </div>
        <Section className="relative h-full w-full gap-4 border-t border-neutral-250 p-8 pt-10">
          <Heading weight="medium">Service health check</Heading>
          <PlaceholderMonitoring />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        </Section>
      </div>
    )

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
