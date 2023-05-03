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
import { useDocumentTitle } from '@qovery/shared/utils'
import PageGeneral from '../../ui/page-general/page-general'

const extractQueryParams = (urlString: string): EventQueryParams => {
  const url = new URL(urlString, window.location.origin) // Add the base URL to properly parse the relative URL
  const searchParams = new URLSearchParams(url.search)

  const queryParams: EventQueryParams = {
    // Parse other query parameters as needed
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

  return queryParams
}

export function PageGeneralFeature() {
  useDocumentTitle('Events - Qovery')
  const { organizationId = '' } = useParams()
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()
  const [queryParams, setQueryParams] = useState<EventQueryParams>({})
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)
  const [pageSize, setPageSize] = useState<string>('10')

  const [placeholderEvents] = useState(eventsFactoryMock(10))

  useEffect(() => {
    const newQueryParams: EventQueryParams = extractQueryParams(location.pathname + location.search)

    setQueryParams(newQueryParams)
  }, [location])

  const onPrevious = () => {
    if (eventsData?.links?.previous) {
      setSearchParams(JSON.parse(JSON.stringify(extractQueryParams(eventsData.links.previous))))
    }
  }

  const onNext = () => {
    if (eventsData?.links?.next) {
      setSearchParams(JSON.parse(JSON.stringify(extractQueryParams(eventsData.links.next))))
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    setPageSize(pageSize)
    setSearchParams((prev) => {
      prev.set('pageSize', pageSize)
      return prev
    })
  }

  return (
    <PageGeneral
      events={eventsData?.events}
      isLoading={isLoading}
      onNext={onNext}
      onPrevious={onPrevious}
      previousDisabled={!eventsData?.links?.previous}
      nextDisabled={!eventsData?.links?.next}
      onPageSizeChange={onPageSizeChange}
      pageSize={pageSize}
      placeholderEvents={placeholderEvents}
    />
  )
}

export default PageGeneralFeature
