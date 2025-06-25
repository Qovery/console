import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { Button, Heading, Icon, InputSelect, Section } from '@qovery/shared/ui'
import { useClusters } from '../hooks/use-clusters/use-clusters'
import { useEvents } from '../hooks/use-events/use-events'
import { useServicesSearch } from '../hooks/use-services-search/use-services-search'
import { CpuChart } from './cpu-chart'
import { MemoryChart } from './memory-chart'
import { ObservabilityProvider, useObservabilityContext } from './observability-context'
import { type TimeRangeOption, timeRangeOptions } from './time-range-utils'

function ObservabilityOverviewContent() {
  const { organizationId = '' } = useParams()
  const {
    isAdmin,
    setIsAdmin,
    customQuery,
    setCustomQuery,
    customApiEndpoint,
    setCustomApiEndpoint,
    clusterId,
    setClusterId,
    serviceId,
    setServiceId,
    useLocalTime,
    setUseLocalTime,
    timeRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    endTimestamp,
    startTimestamp,
    handleTimeRangeChange,
  } = useObservabilityContext()

  const { data: clusters } = useClusters({
    organizationId,
  })

  const { data: services } = useServicesSearch({
    organizationId,
    clusterId,
  })

  const { data: events } = useEvents({
    organizationId,
    serviceId,
    targetType: OrganizationEventTargetType.CONTAINER,
    toTimestamp: endTimestamp,
    fromTimestamp: startTimestamp,
  })

  return (
    <Section className="relative h-full gap-6 rounded-t bg-white p-8">
      <div className="absolute right-1 top-1 z-10 flex flex-col gap-2 rounded border border-neutral-200 bg-neutral-100 p-2 text-left shadow-sm">
        <Button className="ml-auto max-w-max gap-1" variant="outline" size="xs" onClick={() => setIsAdmin(!isAdmin)}>
          Qovery Admin {!isAdmin ? <Icon iconName="chevron-down" /> : <Icon iconName="chevron-up" />}
        </Button>
        {isAdmin && (
          <>
            <div className="flex flex-col space-y-2">
              <label htmlFor="custom-query" className="text-xs font-medium text-neutral-700">
                Custom Query
              </label>
              <textarea
                id="custom-query"
                value={customQuery || ''}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Enter custom query (optional)"
                className="w-[500px] rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="custom-api-endpoint" className="text-xs font-medium text-neutral-700">
                API Endpoint
              </label>
              <input
                id="custom-api-endpoint"
                type="text"
                value={customApiEndpoint || ''}
                onChange={(e) => setCustomApiEndpoint(e.target.value)}
                placeholder="Enter API endpoint (optional)"
                className="w-[500px] rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Heading>Observability Overview</Heading>
        <p className="text-xs text-neutral-400">Monitor your cluster metrics and performance</p>
      </div>

      <div className="grid grid-cols-4 gap-4 rounded border border-neutral-250 bg-neutral-100 p-4">
        <InputSelect
          label="Cluster ID"
          placeholder="Select a cluster"
          className="w-full"
          options={
            clusters?.map((cluster) => ({
              label: `${cluster.name} ${!cluster.metrics_parameters?.enabled ? '(metrics disabled)' : ''}`,
              value: cluster.id,
              isDisabled: !cluster.metrics_parameters?.enabled,
            })) ?? []
          }
          value={clusterId}
          onChange={(e) => setClusterId(e as string)}
        />

        <InputSelect
          label="Service"
          placeholder="Select a service"
          className="w-full"
          options={
            services?.map((service) => ({
              label: `${service.name} (${service.environment_name})`,
              value: service.id,
            })) ?? []
          }
          value={serviceId}
          onChange={(e) => setServiceId(e as string)}
        />

        <InputSelect
          label="Time Range"
          placeholder="Select a time range"
          className="w-full"
          options={timeRangeOptions}
          value={timeRange}
          onChange={(e) => handleTimeRangeChange(e as TimeRangeOption)}
        />

        <InputSelect
          label="Timezone"
          placeholder="Select a timezone"
          className="w-full"
          options={[
            { label: 'Local Time', value: 'local' },
            { label: 'UTC', value: 'utc' },
          ]}
          value={useLocalTime ? 'local' : 'utc'}
          onChange={(e) => setUseLocalTime(e === 'local')}
        />
      </div>

      {timeRange === 'custom' && (
        <div className="grid grid-cols-2 gap-4 rounded border border-neutral-250 bg-neutral-100 p-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium text-neutral-700">
              Start Date
            </label>
            <input
              id="start-date"
              type="datetime-local"
              value={startDate.slice(0, 16)}
              onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium text-neutral-700">
              End Date
            </label>
            <input
              id="end-date"
              type="datetime-local"
              value={endDate.slice(0, 16)}
              onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section className="flex h-full w-full flex-col gap-5 rounded border border-neutral-200 p-4">
          <div className="flex flex-col gap-2">
            <Heading>CPU (mCPU)</Heading>
            <p className="text-xs text-neutral-400">Monitor your CPU usage metrics</p>
          </div>
          <div className="flex h-full w-full flex-col">
            <CpuChart events={events} />
          </div>
        </Section>

        <Section className="flex h-full w-full flex-col gap-5 rounded border border-neutral-200 p-4">
          <div className="flex flex-col gap-2">
            <Heading>Memory (GiB)</Heading>
            <p className="text-xs text-neutral-400">Monitor your memory usage metrics</p>
          </div>
          <div className="flex h-full w-full flex-col">
            <MemoryChart />
          </div>
        </Section>
      </div>
    </Section>
  )
}

export function ObservabilityOverview() {
  return (
    <ObservabilityProvider>
      <ObservabilityOverviewContent />
    </ObservabilityProvider>
  )
}

export default ObservabilityOverview
