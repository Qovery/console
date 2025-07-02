import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { Section } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { CardInstanceRestarts } from './card-instance-restart/card-instance-restarts'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CardMetric } from './card-metric/card-metric'
import { CpuChart } from './cpu-chart/cpu-chart'
import { DiskChart } from './disk-chart/disk-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { SectionFilters } from './section-filters/section-filters'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

const metrics = [
  {
    title: 'Memory issues',
    value: 2,
    status: 'YELLOW' as const,
    description: 'Memory issues detected',
  },
  {
    title: 'Error rate',
    value: '0.5',
    unit: '%',
    status: 'GREEN' as const,
    description: 'Error rate over total requests',
  },
]

function ServiceOverviewContent() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { expandCharts } = useServiceOverviewContext()

  if (!environment) return null

  return (
    <div className="space-y-6">
      <Section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardInstanceRestarts clusterId={environment.cluster_id} serviceId={applicationId} />
        <CardLogErrors clusterId={environment.cluster_id} serviceId={applicationId} />
        {metrics.map((metric, index) => (
          <CardMetric key={index} {...metric} />
        ))}
      </Section>
      <Section className={clsx('rounded border border-neutral-200', expandCharts ? 'border-b-0' : '')}>
        <SectionFilters />
        <div
          className={clsx(
            'grid border-t border-neutral-200',
            expandCharts ? 'grid-cols-1 divide-y divide-neutral-200' : 'grid-cols-2'
          )}
        >
          <div className={clsx(expandCharts ? '' : 'border-b border-r border-neutral-200')}>
            <CpuChart clusterId={environment.cluster_id} serviceId={applicationId} />
          </div>
          <div className={clsx(expandCharts ? '' : 'border-b border-neutral-200')}>
            <MemoryChart clusterId={environment.cluster_id} serviceId={applicationId} />
          </div>
          <div className={clsx(expandCharts ? 'border-b-transparent' : 'border-r border-neutral-200')}>
            <DiskChart clusterId={environment.cluster_id} serviceId={applicationId} />
          </div>
          <div />
        </div>
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
