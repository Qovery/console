/* eslint-disable-next-line */
import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { LoaderSpinner } from '@qovery/shared/ui'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  events?: OrganizationEventResponse[]
  nextLink?: string
  prevLink?: string
}

export function PageGeneral(props: PageGeneralProps) {
  const { isLoading, events, nextLink, prevLink } = props

  console.log(nextLink, prevLink)
  return (
    <div>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <ul>
          {events?.map((event) => (
            <RowEventFeature key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default PageGeneral
