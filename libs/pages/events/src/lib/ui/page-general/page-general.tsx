import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { Icon, IconAwesomeEnum, Pagination, Table, TableHeadProps } from '@qovery/shared/ui'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  events?: OrganizationEventResponse[]
  placeholderEvents?: OrganizationEventResponse[]
  onNext: () => void
  onPrevious: () => void
  nextDisabled?: boolean
  previousDisabled?: boolean
  onPageSizeChange?: (pageSize: string) => void
  pageSize?: string
}

export function PageGeneral(props: PageGeneralProps) {
  const {
    isLoading,
    events,
    onNext,
    onPrevious,
    onPageSizeChange,
    nextDisabled,
    previousDisabled,
    pageSize,
    placeholderEvents,
  } = props
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

  return (
    <>
      <div className="py-6 flex justify-between">
        <h2 className="h4 text-text-700">Events</h2>
      </div>

      <Table
        dataHead={dataHead}
        data={events}
        className="border border-element-light-lighter-400 rounded"
        classNameHead="rounded-t"
      >
        <div>
          {isLoading ? (
            placeholderEvents?.map((event) => <RowEventFeature key={event.timestamp} event={event} isPlaceholder />)
          ) : events && events.length === 0 ? (
            <div className="text-center py-4 px-5">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1" data-testid="empty-result">
                No events found. <br /> Try to change your filters.
              </p>
            </div>
          ) : (
            events?.map((event) => <RowEventFeature key={event.timestamp} event={event} />)
          )}
        </div>
      </Table>
      <Pagination
        className="pt-4 pb-20"
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={nextDisabled}
        previousDisabled={previousDisabled}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  )
}

export default PageGeneral
