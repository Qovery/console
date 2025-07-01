import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { Section } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { useEvents } from '../hooks/use-events/use-events'
import { CardMetric } from './card-metric/card-metric'
import { CpuChart } from './cpu-chart/cpu-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { SectionFilters } from './section-filters/section-filters'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

const metrics = [
  {
    title: 'Instance restarts',
    value: 0,
    status: 'HEALTHY' as const,
    description: 'Pod restarts in the last 24h',
  },
  {
    title: 'Memory issues',
    value: 2,
    status: 'WARNING' as const,
    description: 'Memory issues detected',
  },
  {
    title: 'Error rate',
    value: '0.5',
    unit: '%',
    status: 'HEALTHY' as const,
    description: 'Error rate over total requests',
  },
  {
    title: 'Log errors',
    value: 12,
    status: 'ERROR' as const,
    description: 'Error logs in the last hour',
  },
]

function ServiceOverviewContent() {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  const { startTimestamp, endTimestamp } = useServiceOverviewContext()

  const { data: events } = useEvents({
    organizationId,
    serviceId: applicationId,
    targetType: OrganizationEventTargetType.CONTAINER,
    toTimestamp: endTimestamp,
    fromTimestamp: startTimestamp,
  })

  if (!environment) return null

  return (
    <div className="space-y-6">
      <Section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <CardMetric key={index} {...metric} />
        ))}
      </Section>
      <Section className="rounded border border-neutral-200">
        <SectionFilters />
        <Section className="grid grid-cols-1 divide-x border-t border-neutral-200 md:grid-cols-2">
          <CpuChart clusterId={environment.cluster_id} serviceId={applicationId} events={events} />
          <MemoryChart clusterId={environment.cluster_id} serviceId={applicationId} events={events} />
        </Section>
      </Section>
    </div>
  )
}

export function ServiceOverview() {
  return (
    <ServiceOverviewProvider>
      <ServiceOverviewContent />
    </ServiceOverviewProvider>
  )
}

export default ServiceOverview
