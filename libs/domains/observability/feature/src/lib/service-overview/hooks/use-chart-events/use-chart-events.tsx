import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { useEvents } from '../../../hooks/use-events/use-events'
import type { ReferenceLineEvent } from '../../local-chart/local-chart'
import { useServiceOverviewContext } from '../../util-filter/service-overview-context'

export interface UseChartEventsProps {
  serviceId: string
  additionalEvents?: ReferenceLineEvent[]
}

export function useChartEvents({ serviceId, additionalEvents = [] }: UseChartEventsProps) {
  const { organizationId = '' } = useParams()
  const { startTimestamp, endTimestamp } = useServiceOverviewContext()

  const { data: service } = useService({ serviceId })

  const { data: events } = useEvents({
    organizationId,
    serviceId,
    targetType:
      service?.service_type === 'CONTAINER'
        ? OrganizationEventTargetType.CONTAINER
        : OrganizationEventTargetType.APPLICATION,
    toTimestamp: endTimestamp,
    fromTimestamp: startTimestamp,
  })

  const eventsFiltered = events?.filter((event) => event.target_id === serviceId)

  const serviceEvents: ReferenceLineEvent[] = useMemo(() => {
    return (eventsFiltered || [])
      .filter(
        (event) =>
          (event.event_type === 'TRIGGER_DEPLOY' ||
            event.event_type === 'DEPLOY_FAILED' ||
            event.event_type === 'DEPLOYED') &&
          event.target_id === serviceId
      )
      .map((event) => {
        const eventTimestamp = new Date(event.timestamp || '').getTime()

        const key = `event-${event.id || eventTimestamp}`
        const change = JSON.parse(event.change || '')
        const version =
          change?.service_source?.image?.tag ??
          change?.service_source?.docker?.git_repository?.deployed_commit_id ??
          'Unknown'

        const repository =
          change?.service_source?.image?.image_name ?? change?.service_source?.docker?.git_repository?.url ?? 'Unknown'

        if (event.event_type === 'DEPLOY_FAILED') {
          return {
            type: 'event' as const,
            timestamp: eventTimestamp,
            reason: 'Deploy failed',
            icon: 'xmark' as const,
            color: 'var(--color-red-500)',
            key,
            version,
            repository,
          }
        } else if (event.event_type === 'DEPLOYED') {
          return {
            type: 'event' as const,
            timestamp: eventTimestamp,
            reason: 'Deployed',
            icon: 'check' as const,
            color: 'var(--color-green-500)',
            key,
            version,
            repository,
          }
        } else if (event.event_type === 'TRIGGER_DEPLOY') {
          return {
            type: 'event' as const,
            timestamp: eventTimestamp,
            reason: 'Trigger deploy',
            icon: 'play' as const,
            iconStyle: 'solid' as const,
            color: 'var(--color-brand-500)',
            key,
            version,
            repository,
          }
        }

        return {
          type: 'event' as const,
          timestamp: eventTimestamp,
          reason: 'Unknown',
          icon: 'question' as const,
          color: 'var(--color-neutral-350)',
          key,
          version,
          repository,
        }
      })
  }, [eventsFiltered, serviceId])

  const mergedEvents = useMemo(() => {
    const allEvents = [...additionalEvents, ...serviceEvents]

    const uniqueEvents = allEvents.filter(
      (event, index, array) => array.findIndex((e) => e.timestamp === event.timestamp && e.key === event.key) === index
    )

    return uniqueEvents.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  }, [additionalEvents, serviceEvents])

  return {
    service,
    events: mergedEvents,
    isLoading: !events && !eventsFiltered,
  }
}
