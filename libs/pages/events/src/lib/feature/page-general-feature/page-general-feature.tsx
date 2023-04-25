/* eslint-disable-next-line */
import { useParams } from 'react-router-dom'
import { useFetchEvents } from '@qovery/domains/event'
import PageGeneral from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { organizationId = '' } = useParams()

  const { data: eventsData, isLoading } = useFetchEvents(organizationId)

  return (
    <PageGeneral
      events={eventsData?.events}
      isLoading={isLoading}
      nextLink={eventsData?.links?.next}
      prevLink={eventsData?.links?.previous}
    />
  )
}

export default PageGeneralFeature
