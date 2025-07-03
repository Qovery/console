import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { Section } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { CardAutoscalingLimitReached } from './card-autoscaling-limit-reached/card-autoscaling-limit-reached'
import { CardHTTPErrors } from './card-http-errors/card-http-errors'
import { CardInstanceRestarts } from './card-instance-restart/card-instance-restarts'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CpuChart } from './cpu-chart/cpu-chart'
import { DiskChart } from './disk-chart/disk-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { SectionFilters } from './section-filters/section-filters'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

function ServiceOverviewContent() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { expandCharts } = useServiceOverviewContext()

  if (!environment || !service) return null

  const hasPort =
    (service.serviceType === 'APPLICATION' && (service?.ports || []).length > 0) ||
    (service.serviceType === 'CONTAINER' && (service?.ports || []).length > 0)

  return (
    <div className="space-y-6">
      <Section
        className={clsx(
          'grid grid-cols-1 gap-4',
          hasPort ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        <CardInstanceRestarts clusterId={environment.cluster_id} serviceId={applicationId} />
        <CardAutoscalingLimitReached clusterId={environment.cluster_id} serviceId={applicationId} />
        <CardLogErrors clusterId={environment.cluster_id} serviceId={applicationId} />
        {hasPort && <CardHTTPErrors clusterId={environment.cluster_id} serviceId={applicationId} />}
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
