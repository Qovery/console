import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type Database } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Icon, InputSelectSmall, Section, Tooltip } from '@qovery/shared/ui'
import { useEnvironment } from '../../hooks/use-environment/use-environment'
import { DashboardProvider, useDashboardContext } from '../../util-filter/dashboard-context'
import { CardAvailableRam } from './card-available-ram/card-available-ram'
import { CardAvgCpuUtilization } from './card-avg-cpu-utilization/card-avg-cpu-utilization'
import { CardAvgDbConnections } from './card-avg-db-connections/card-avg-db-connections'
import CardMaxSwapUsage from './card-max-swap-usage/card-max-swap-usage'
import { CardUnvacuumedTransactions } from './card-unvacuumed-transactions/card-unvacuumed-transactions'
import RdsConnectionsChart from './rds-connections-chart/rds-connections-chart'
import { RdsCpuChart } from './rds-cpu-chart/rds-cpu-chart'
import { RdsDiskQueueDepthChart } from './rds-disk-queue-depth-chart/rds-disk-queue-depth-chart'
import { RdsRamChart } from './rds-ram-chart/rds-ram-chart'
import RdsReadIopChart from './rds-read-iop-chart/rds-read-iop-chart'
import RdsReadLatencyChart from './rds-read-latency-chart/rds-read-latency-chart'
import RdsStorageAvailableChart from './rds-storage-available-chart/rds-storage-available-chart'
import RdsWriteIopChart from './rds-write-iop-chart/rds-write-iop-chart'
import RdsWriteLatencyChart from './rds-write-latency-chart/rds-write-latency-chart'
import { SelectTimeRange } from './select-time-range/select-time-range'
import { generateDbInstance } from './util/generate-db-instance'

function DatabaseRdsDashboardContent() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ serviceId })
  const { data: environment } = useEnvironment({ environmentId })
  const {
    expandCharts,
    useLocalTime,
    setUseLocalTime,
    hideEvents,
    setHideEvents,
    setExpandCharts,
    isLiveUpdateEnabled,
    setIsLiveUpdateEnabled,
    handleTimeRangeChange,
    timeRange,
  } = useDashboardContext()

  if (!environment || !service)
    return (
      <div className="flex min-h-page-container w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  // Generate the RDS database instance identifier
  const dbInstance = generateDbInstance(service as Database)

  return (
    <div className="isolate">
      <div className="bg-surface sticky top-[45px] z-header h-14 w-full bg-background">
        <div className="mx-8 flex min-h-14 flex-col justify-between gap-3 border-b border-neutral py-3 md:h-full md:min-h-0 md:flex-row md:items-center md:py-0">
          <div className="flex flex-wrap gap-2">
            <Tooltip
              content={
                <span>
                  Live refresh (15s) <br />
                  Only for time ranges ≤ 1h
                </span>
              }
            >
              <Button
                variant={isLiveUpdateEnabled ? 'solid' : 'surface'}
                color={isLiveUpdateEnabled ? 'brand' : 'neutral'}
                size="md"
                className={clsx('gap-1.5 pl-2.5', isLiveUpdateEnabled && 'border border-transparent')}
                onClick={() => {
                  if (!isLiveUpdateEnabled) {
                    if (timeRange !== '5m' && timeRange !== '15m' && timeRange !== '30m' && timeRange !== '1h') {
                      handleTimeRangeChange('15m')
                    }
                  }
                  setIsLiveUpdateEnabled(!isLiveUpdateEnabled)
                }}
              >
                <Icon iconName={isLiveUpdateEnabled ? 'circle-stop' : 'circle-play'} iconStyle="regular" />
                Live
              </Button>
            </Tooltip>
            <SelectTimeRange />
            <InputSelectSmall
              name="timezone"
              className="w-[120px] [&>i]:top-2"
              inputClassName="h-8"
              items={[
                { label: 'Local Time', value: 'local' },
                { label: 'UTC', value: 'utc' },
              ]}
              defaultValue={useLocalTime ? 'local' : 'utc'}
              onChange={(e) => setUseLocalTime(e === 'local')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="plain"
              size="xs"
              className="flex items-center gap-1"
              onClick={() => setHideEvents(!hideEvents)}
            >
              {hideEvents ? 'Show events' : 'Hide events'}
              <Icon iconName={hideEvents ? 'eye' : 'eye-slash'} iconStyle="regular" />
            </Button>
            <Button
              variant="plain"
              size="xs"
              className="flex items-center gap-1"
              onClick={() => setExpandCharts(!expandCharts)}
            >
              {expandCharts ? 'Collapse charts' : 'Expand charts'}
              <Icon iconName={expandCharts ? 'arrows-minimize' : 'arrows-maximize'} iconStyle="light" />
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-8 px-8 py-8">
        <Section className="gap-4">
          <Heading weight="medium" level={2}>
            Health overview
          </Heading>
          <div className={clsx('grid h-full gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3')}>
            <CardUnvacuumedTransactions clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvgDbConnections clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvgCpuUtilization clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvailableRam clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardMaxSwapUsage clusterId={environment.cluster_id} dbInstance={dbInstance} />
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium" level={2}>
            Resources
          </Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsCpuChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsRamChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsDiskQueueDepthChart
                serviceId={serviceId}
                clusterId={environment.cluster_id}
                dbInstance={dbInstance}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsConnectionsChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium" level={2}>
            Query performance
          </Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsWriteLatencyChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsReadLatencyChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium" level={2}>
            Storage & I/O
          </Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsWriteIopChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsReadIopChart serviceId={serviceId} clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <RdsStorageAvailableChart
                serviceId={serviceId}
                clusterId={environment.cluster_id}
                dbInstance={dbInstance}
                storageResourceInGiB={(service as Database).storage}
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export function DatabaseRdsDashboard() {
  const { organizationId = '' } = useParams({ strict: false })

  return (
    <DashboardProvider organizationId={organizationId}>
      <DatabaseRdsDashboardContent />
    </DashboardProvider>
  )
}

export default DatabaseRdsDashboard
