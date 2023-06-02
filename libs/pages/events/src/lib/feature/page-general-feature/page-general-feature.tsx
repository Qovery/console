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
import { convertDatetoTimestamp, useDocumentTitle } from '@qovery/shared/utils'
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
  const [, setSearchParams] = useSearchParams()
  const [queryParams, setQueryParams] = useState<EventQueryParams>({})
  const [pageSize, setPageSize] = useState<string>('30')
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)
  const [timestamps, setTimestamps] = useState<[Date, Date] | undefined>()
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)

  useEffect(() => {
    const newQueryParams: EventQueryParams = extractEventQueryParams(location.pathname + location.search)

    if (newQueryParams.pageSize) setPageSize(newQueryParams.pageSize.toString())
    if (newQueryParams.fromTimestamp && newQueryParams.toTimestamp)
      setTimestamps([
        new Date(parseInt(newQueryParams.fromTimestamp, 10) * 1000),
        new Date(parseInt(newQueryParams.toTimestamp, 10) * 1000),
      ])

    setQueryParams(newQueryParams)
  }, [location])

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

  const handleClearTimestamp = () => {
    setSearchParams((prev) => {
      prev.delete('fromTimestamp')
      prev.delete('toTimestamp')
      return prev
    })
    setTimestamps(undefined)
    setIsOpenTimestamp(false)
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
      timestamps={timestamps}
      setIsOpenTimestamp={setIsOpenTimestamp}
      isOpenTimestamp={isOpenTimestamp}
    />
  )
}

export default PageGeneralFeature
