import { useQuery } from '@tanstack/react-query'
import { ClustersApi, type GetClusterKubernetesEvents200ResponseResultsInner } from 'qovery-typescript-axios'
import { Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const clusterApi = new ClustersApi()

const getColorFromReason = (reason: string | undefined): string => {
  switch (reason) {
    case 'Launched':
      return 'text-green-500'
    case 'Disrupted':
    case 'Terminated':
      return 'text-orange-500'
    default:
      return 'text-neutral-400'
  }
}

export function CardNodeEvents({ clusterId }: { clusterId: string }) {
  const { startTimestamp, endTimestamp } = useDashboardContext()

  const fromDateTime = new Date(parseInt(startTimestamp, 10) * 1000).toISOString()
  const toDateTime = new Date(parseInt(endTimestamp, 10) * 1000).toISOString()

  const { data, isLoading } = useQuery({
    queryKey: ['clusterKubernetesEvents', clusterId, fromDateTime, toDateTime, 'karpenter.sh'],
    queryFn: async () => {
      const response = await clusterApi.getClusterKubernetesEvents(
        clusterId,
        fromDateTime,
        toDateTime,
        undefined,
        undefined,
        'karpenter.sh'
      )
      return response.data.results ?? []
    },
    enabled: Boolean(clusterId && startTimestamp && endTimestamp),
  })

  if (isLoading) {
    return (
      <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
        <div className="flex items-center justify-between px-5 pt-4">
          <Skeleton show width={200} height={16} />
        </div>
        <div className="flex flex-col gap-2 p-5">
          <Skeleton show width="100%" height={32} />
          <Skeleton show width="100%" height={32} />
          <Skeleton show width="100%" height={32} />
        </div>
      </Section>
    )
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
      <div className="flex items-center gap-1.5 px-5 pt-4">
        <Heading weight="medium">Node infrastructure events</Heading>
        <Tooltip content="Kubernetes events from Karpenter node lifecycle management (scale up/down, consolidation)">
          <span>
            <Icon iconName="circle-info" iconStyle="regular" className="text-sm text-neutral-350" />
          </span>
        </Tooltip>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="w-full text-ssm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-400">
              <th className="pb-2 pr-4 font-medium">Time</th>
              <th className="pb-2 pr-4 font-medium">Kind</th>
              <th className="pb-2 pr-4 font-medium">Name</th>
              <th className="pb-2 pr-4 font-medium">Reason</th>
              <th className="pb-2 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {data.map((event: GetClusterKubernetesEvents200ResponseResultsInner, index: number) => (
              <tr key={index} className="border-b border-neutral-100 last:border-0">
                <td className="py-2 pr-4 text-neutral-400">
                  {event.created_at ? new Date(event.created_at).toLocaleString() : '—'}
                </td>
                <td className="py-2 pr-4 text-neutral-400">{event.kind ?? '—'}</td>
                <td className="py-2 pr-4 font-medium text-neutral-600">{event.name ?? '—'}</td>
                <td className={`py-2 pr-4 font-medium ${getColorFromReason(event.reason)}`}>
                  {event.reason ?? '—'}
                </td>
                <td className="py-2 text-neutral-400">{event.message ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export default CardNodeEvents
