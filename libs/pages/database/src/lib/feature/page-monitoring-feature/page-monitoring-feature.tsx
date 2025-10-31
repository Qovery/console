import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  EnableObservabilityButtonContactUs,
  EnableObservabilityContent,
  EnableObservabilityVideo,
  RdsManagedDbOverview,
} from '@qovery/domains/observability/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PlaceholderMonitoring } from './placeholder-monitoring'

export function PageMonitoringFeature() {
  const { databaseId = '', environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: serviceStatus } = useDeploymentStatus({ environmentId, serviceId: databaseId })
  const { data: service, isFetched: isServiceFetched } = useService({ environmentId, serviceId: databaseId })
  const { data: cluster, isFetched: isClusterFetched } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

  useDocumentTitle('Monitoring - Qovery')

  const hasMetrics = useMemo(
    () =>
      cluster?.cloud_provider === 'AWS' &&
      cluster?.metrics_parameters?.enabled &&
      service?.serviceType === 'DATABASE' &&
      (service as Database)?.mode === DatabaseModeEnum.MANAGED,
    [cluster?.cloud_provider, cluster?.metrics_parameters?.enabled, service]
  )

  const noMetricsAvailable = useMemo(
    () => serviceStatus?.state === 'STOPPED' || serviceStatus?.state === 'READY',
    [serviceStatus?.state]
  )

  if (!isClusterFetched || !isServiceFetched) return null

  if (!hasMetrics)
    return (
      <div className="relative">
        <Section className="relative h-full w-full gap-4 border-t border-neutral-250 p-8 pt-10">
          <Heading weight="medium">Database health check</Heading>
          <PlaceholderMonitoring />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        </Section>
        <div className="absolute left-1/2 top-1/2 flex h-max min-w-[860px] -translate-x-1/2 -translate-y-1/2 items-center gap-10 rounded border border-neutral-250 bg-white p-6 shadow-lg xl:top-[74%] xl:min-w-[1200px]">
          <div className="flex w-1/2 flex-col gap-8">
            <EnableObservabilityContent className="text-sm leading-normal" />
            <div className="flex items-center gap-4">
              <EnableObservabilityButtonContactUs />
              <span className="text-sm font-semibold text-neutral-400">Starting from $299/month</span>
            </div>
          </div>
          <div className="relative left-4 flex h-full w-1/2 items-center 2xl:left-0">
            <EnableObservabilityVideo />
          </div>
        </div>
      </div>
    )

  return noMetricsAvailable ? (
    <div className="px-10 py-7">
      <div className="flex flex-col items-center gap-1 rounded border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
        <Icon className="text-md text-neutral-300" iconStyle="regular" iconName="circle-question" />
        <span className="font-medium">Monitoring is not available</span>
        <span>Deploy this database to view monitoring data</span>
      </div>
    </div>
  ) : (
    <RdsManagedDbOverview />
  )
}

export default PageMonitoringFeature
