import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createEnumParam } from 'serialize-query-params'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { type EventQueryParams, useFetchEvents } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
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
export const queryParamsValues = {
  pageSize: withDefault(NumberParam, 30),
  origin: createEnumParam(Object.values(OrganizationEventOrigin)),
  subTargetType: createEnumParam(Object.values(OrganizationEventSubTargetType)),
  triggeredBy: StringParam,
  targetId: StringParam,
  targetType: createEnumParam(Object.values(OrganizationEventTargetType)),
  eventType: createEnumParam(Object.values(OrganizationEventType)),
  toTimestamp: StringParam,
  fromTimestamp: StringParam,
  continueToken: StringParam,
  stepBackToken: StringParam,
  projectId: StringParam,
  environmentId: StringParam,
}

export const hasEnvironment = (targetType?: string) =>
  targetType === OrganizationEventTargetType.APPLICATION ||
  targetType === OrganizationEventTargetType.CONTAINER ||
  targetType === OrganizationEventTargetType.DATABASE ||
  targetType === OrganizationEventTargetType.HELM ||
  targetType === OrganizationEventTargetType.JOB

export const hasProject = (targetType?: string) =>
  targetType === OrganizationEventTargetType.ENVIRONMENT || hasEnvironment(targetType)

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)

  // Sync queryParams -> table filters
  useEffect(() => {
    if (queryParams.origin)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'origin' && item.value === queryParams.origin)
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'origin', value: queryParams.origin || '' }]
          return updatedFilters
        }
        return prev
      })

    if (queryParams.eventType)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'event_type' && item.value === queryParams.eventType)
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'event_type', value: queryParams.eventType || '' }]
          return updatedFilters
        }
        return prev
      })
  }, [queryParams])

  // Sync table filters -> queryParams
  useEffect(() => {
    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key as keyof EventQueryParams

      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      if (currentFilter.value === ALL) {
        setQueryParams({
          [currentKey]: undefined,
        })
      } else {
        setQueryParams({
          [currentKey]: currentFilter.value,
        })
      }
    }
  }, [filter])

  const onPrevious = () => {
    if (eventsData?.links?.previous) {
      setQueryParams({
        stepBackToken: new URLSearchParams(eventsData.links.previous.split('?')[1]).get('stepBackToken'),
        continueToken: undefined,
      })
    }
  }

  const onNext = () => {
    if (eventsData?.links?.next) {
      setQueryParams({
        continueToken: new URLSearchParams(eventsData.links.next.split('?')[1]).get('continueToken'),
        stepBackToken: undefined,
      })
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    setQueryParams({ pageSize: parseInt(pageSize, 10) })
  }

  const handleClearFilter = () => {
    setQueryParams({}, 'push')
    setFilter([])
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
      pageSize={queryParams.pageSize.toString()}
      placeholderEvents={eventsFactoryMock(30)}
      handleClearFilter={handleClearFilter}
      filter={filter}
      setFilter={setFilter}
    />
  )
}

export default PageGeneralFeature
