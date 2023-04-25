import { useParams } from 'react-router-dom'
import { useFetchEvents } from '@qovery/domains/event'
import { LoaderSpinner } from '@qovery/shared/ui'

export function PageEvents() {
  const { organizationId = '' } = useParams()
  const { data: eventsData, isLoading } = useFetchEvents(organizationId)

  return (
    <div>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <ul>
          {eventsData?.events?.map((event) => (
            <li key={event.id}>
              {event.id} - {event.origin} - {event.timestamp}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PageEvents
