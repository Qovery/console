import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { EventQueryParams, useFetchEventTargets, useFetchEvents } from '@qovery/domains/event'
import { selectProjectsEntitiesByOrgId } from '@qovery/domains/projects'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, TableFilterProps } from '@qovery/shared/ui'
import { convertDatetoTimestamp, useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
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
  }

  // remove undefined values with typescript typing
  Object.keys(queryParams).forEach(
    (key) =>
      queryParams[key as keyof EventQueryParams] === undefined && delete queryParams[key as keyof EventQueryParams]
  )
  return queryParams
}

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [queryParams, setQueryParams] = useState<EventQueryParams>({})
  const [pageSize, setPageSize] = useState<string>('30')
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)
  const [timestamps, setTimestamps] = useState<[Date, Date] | undefined>()
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)
  const projects = useSelector((state: RootState) => selectProjectsEntitiesByOrgId(state, organizationId))
  const { data: environments } = useFetchEnvironments(searchParams.get('projectId') || '')
  const { data: eventsTargetsData, refetch } = useFetchEventTargets(organizationId, queryParams)

  useEffect(() => {
    console.log(eventsTargetsData)
    refetch()
  }, [searchParams.get('projectId')])

  useEffect(() => {
    const newQueryParams: EventQueryParams = extractEventQueryParams(location.pathname + location.search)

    if (newQueryParams.pageSize) setPageSize(newQueryParams.pageSize.toString())
    if (newQueryParams.fromTimestamp && newQueryParams.toTimestamp)
      setTimestamps([
        new Date(parseInt(newQueryParams.fromTimestamp, 10) * 1000),
        new Date(parseInt(newQueryParams.toTimestamp, 10) * 1000),
      ])

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

  const handleChangeTimestamp = (startDate: Date, endDate: Date) => {
    setSearchParams((prev) => {
      prev.delete('continueToken')
      prev.delete('stepBackToken')
      prev.set('fromTimestamp', convertDatetoTimestamp(startDate.toString()).toString())
      prev.set('toTimestamp', endDate ? convertDatetoTimestamp(endDate.toString()).toString() : '')
      return prev
    })
    setTimestamps([startDate, endDate])
    setIsOpenTimestamp(!isOpenTimestamp)
  }

  const handeChangeType = (name: string, value?: string | string[]) => {
    if (name === 'targetType') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('targetType', value as string)
        } else {
          prev.delete('targetType')
          prev.delete('projectId')
        }
        return prev
      })
    } else if (name === 'projectId') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('projectId', value as string)
        } else {
          prev.delete('projectId')
        }
        return prev
      })
    } else if (name === 'environmentId') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('environmentId', value as string)
        } else {
          prev.delete('environmentId')
        }
        return prev
      })
    }
  }

  const handleClearTimestamp = () => {
    setSearchParams((prev) => {
      prev.delete('fromTimestamp')
      prev.delete('toTimestamp')
      return prev
    })
    setTimestamps(undefined)
    setIsOpenTimestamp(false)
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
      return prev
    })
    setFilter([])
    handleClearTimestamp()
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
      onChangeTimestamp={handleChangeTimestamp}
      onChangeClearTimestamp={handleClearTimestamp}
      onChangeType={handeChangeType}
      handleClearFilter={handleClearFilter}
      timestamps={timestamps}
      setIsOpenTimestamp={setIsOpenTimestamp}
      isOpenTimestamp={isOpenTimestamp}
      filter={filter}
      setFilter={setFilter}
      projects={projects}
      environments={environments}
    />
  )
}

export default PageGeneralFeature
