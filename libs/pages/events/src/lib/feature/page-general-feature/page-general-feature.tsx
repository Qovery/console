import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { EventQueryParams, useFetchEvents } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import PageGeneral from '../../ui/page-general/page-general'

export const extractEventQueryParams = (urlString: string): EventQueryParams => {
  const url = new URL(urlString, window.location.origin) // add the base URL to properly parse the relative URL
  const searchParams = new URLSearchParams(url.search)

  const queryParams: EventQueryParams = {
    // parse other query parameters as needed
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize') as string, 10) : undefined,
    origin: (searchParams.get('origin') as OrganizationEventOrigin) || undefined,
    subTargetType: (searchParams.get('subTargetType') as OrganizationEventSubTargetType) || undefined,
    triggeredBy: searchParams.get('triggeredBy') || undefined,
    targetId: searchParams.get('targetId') || undefined,
    targetType: (searchParams.get('targetType') as OrganizationEventTargetType) || undefined,
    eventType: (searchParams.get('eventType') as OrganizationEventType) || undefined,
    toTimestamp: searchParams.get('toTimestamp') || undefined,
    fromTimestamp: searchParams.get('fromTimestamp') || undefined,
    continueToken: searchParams.get('continueToken') || undefined,
    stepBackToken: searchParams.get('stepBackToken') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    environmentId: searchParams.get('environmentId') || undefined,
  }

  // remove undefined values with typescript typing
  Object.keys(queryParams).forEach(
    (key) =>
      queryParams[key as keyof EventQueryParams] === undefined && delete queryParams[key as keyof EventQueryParams]
  )
  return queryParams
}

export const hasEnvironment = (targetType?: string) =>
  targetType === OrganizationEventTargetType.APPLICATION ||
  targetType === OrganizationEventTargetType.CONTAINER ||
  targetType === OrganizationEventTargetType.DATABASE ||
  targetType === OrganizationEventTargetType.JOB

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()
  const [queryParams, setQueryParams] = useState<EventQueryParams>({})
  const [pageSize, setPageSize] = useState<string>('30')
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)

  useEffect(() => {
    const newQueryParams: EventQueryParams = extractEventQueryParams(location.pathname + location.search)

    if (newQueryParams.pageSize) setPageSize(newQueryParams.pageSize.toString())

    if (newQueryParams.origin)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'origin' && item.value === newQueryParams.origin)
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'origin', value: newQueryParams.origin }]
          return updatedFilters
        }
        return prev
      })

    if (newQueryParams.eventType)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'event_type' && item.value === newQueryParams.eventType
        )
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'event_type', value: newQueryParams.eventType }]
          return updatedFilters
        }
        return prev
      })

    setQueryParams(newQueryParams)
  }, [location])

  // set filter if is a query params change
  useEffect(() => {
    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key as keyof EventQueryParams

      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      setSearchParams((prev) => {
        if (currentFilter.value === ALL) {
          prev.delete(currentKey)
        } else {
          prev.delete(currentKey)
          prev.set(currentKey, currentFilter.value || '')
        }
        return prev
      })
    }
  }, [filter])

  const onPrevious = () => {
    if (eventsData?.links?.previous) {
      setSearchParams(JSON.parse(JSON.stringify(extractEventQueryParams(eventsData.links.previous))))
    }
  }

  const onNext = () => {
    if (eventsData?.links?.next) {
      setSearchParams(JSON.parse(JSON.stringify(extractEventQueryParams(eventsData.links.next))))
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    setPageSize(pageSize)
    setSearchParams((prev) => {
      prev.set('pageSize', pageSize)
      return prev
    })
  }

  const handleClearFilter = () => {
    setSearchParams((prev) => {
      prev.delete('origin')
      prev.delete('eventType')
      prev.delete('targetType')
      prev.delete('continueToken')
      prev.delete('stepBackToken')
      prev.delete('projectId')
      prev.delete('environmentId')
      prev.delete('targetId')
      prev.delete('fromTimestamp')
      prev.delete('toTimestamp')
      return prev
    })
    setFilter([])
    setQueryParams({})
  }

  return (
    <PageGeneral
      events={eventsData?.events || eventsFactoryMock(30)}
      isLoading={isLoading}
      onNext={onNext}
      onPrevious={onPrevious}
      previousDisabled={!eventsData?.links?.previous}
      nextDisabled={!eventsData?.links?.next}
      onPageSizeChange={onPageSizeChange}
      pageSize={pageSize}
      placeholderEvents={eventsFactoryMock(30)}
      handleClearFilter={handleClearFilter}
      queryParams={queryParams}
      filter={filter}
      setFilter={setFilter}
    />
  )
}

export default PageGeneralFeature
