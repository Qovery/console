import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { EventQueryParams, useFetchEvents } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import PageGeneral from '../../ui/page-general/page-general'

export const hasEnvironment = (targetType?: string) =>
  targetType === OrganizationEventTargetType.APPLICATION ||
  targetType === OrganizationEventTargetType.CONTAINER ||
  targetType === OrganizationEventTargetType.DATABASE ||
  targetType === OrganizationEventTargetType.JOB

export const queryParamsValues = {
  pageSize: withDefault(NumberParam, 30),
  origin: StringParam,
  subTargetType: StringParam,
  triggeredBy: StringParam,
  targetId: StringParam,
  targetType: StringParam,
  eventType: StringParam,
  toTimestamp: StringParam,
  fromTimestamp: StringParam,
  continueToken: StringParam,
  stepBackToken: StringParam,
  projectId: StringParam,
  environmentId: StringParam,
  name: StringParam,
}

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  // const [, setSearchParams] = useSearchParams()

  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)

  // const [pageSize, setPageSize] = useState<number>(30)
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams as any)

  useEffect(() => {
    // if (queryParams.pageSize) setQueryParams({ pageSize: queryParams.pageSize }, 'pushIn')

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

  // set filter if is a query params change
  useEffect(() => {
    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key as keyof EventQueryParams

      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      setQueryParams((prev) => {
        console.log(prev)
        if (currentFilter.value === ALL) {
          return { [currentKey]: undefined, ...prev }
        }

        return prev
      }, 'pushIn')
    }
  }, [filter])

  const onPrevious = () => {
    if (eventsData?.links?.previous) {
      setQueryParams({ stepBackToken: eventsData.links.previous }, 'pushIn')
      // setSearchParams(JSON.parse(JSON.stringify(extractEventQueryParams(eventsData.links.previous))))
    }
  }

  const onNext = () => {
    if (eventsData?.links?.next) {
      setQueryParams({ continueToken: eventsData.links.next }, 'pushIn')
      // setSearchParams(JSON.parse(JSON.stringify(extractEventQueryParams(eventsData.links.next))))
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    setQueryParams({ pageSize: parseInt(pageSize, 10) }, 'pushIn')
    // setPageSize(pageSize)
    // setSearchParams((prev) => {
    //   prev.set('pageSize', pageSize)
    //   return prev
    // })
  }

  const handleClearFilter = () => {
    setQueryParams({}, 'push')
    // setSearchParams((prev) => {
    //   prev.delete('origin')
    //   prev.delete('eventType')
    //   prev.delete('targetType')
    //   prev.delete('continueToken')
    //   prev.delete('stepBackToken')
    //   prev.delete('projectId')
    //   prev.delete('environmentId')
    //   prev.delete('targetId')
    //   prev.delete('fromTimestamp')
    //   prev.delete('toTimestamp')
    //   return prev
    // })
    // setFilter([])
    // setQueryParams({})
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
