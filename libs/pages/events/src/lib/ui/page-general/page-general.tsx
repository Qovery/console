import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { LoaderSpinner, Table, TableHeadProps } from '@qovery/shared/ui'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  events?: OrganizationEventResponse[]
  nextLink?: string
  prevLink?: string
}

export function PageGeneral(props: PageGeneralProps) {
  const { isLoading, events, nextLink, prevLink } = props
  const dataHead: TableHeadProps<OrganizationEventResponse>[] = [
    {
      title: 'Timestamp',
    },
    {
      title: 'Event type',
    },
    {
      title: 'Target type',
    },
    {
      title: 'Target',
    },
    {
      title: 'Change',
    },
    {
      title: 'User',
    },
    {
      title: 'Tool',
    },
  ]

  console.log(nextLink, prevLink)
  return (
    <div>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <Table
          dataHead={dataHead}
          data={events}
          className="border border-element-light-lighter-400 rounded"
          classNameHead="!bg-transparent"
        >
          <>
            {events?.map((event) => (
              <RowEventFeature key={event.timestamp} event={event} nbCols={dataHead.length} />
            ))}
          </>
        </Table>
      )}
    </div>
  )
}

export default PageGeneral
