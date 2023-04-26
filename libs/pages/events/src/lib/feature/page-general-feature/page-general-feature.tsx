/* eslint-disable-next-line */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFetchEvents } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import PageGeneral from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { organizationId = '' } = useParams()

  const { data: eventsData, isLoading } = useFetchEvents(organizationId)
  const [events] = useState(eventsFactoryMock(10))

  return (
    <PageGeneral
      events={events}
      isLoading={false && isLoading}
      nextLink={eventsData?.links?.next}
      prevLink={eventsData?.links?.previous}
    />
  )
}

export default PageGeneralFeature
