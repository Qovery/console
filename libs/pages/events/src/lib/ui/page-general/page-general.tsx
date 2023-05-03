import { OrganizationEventResponse } from 'qovery-typescript-axios'
import {
  Button,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  InputSearch,
  Pagination,
  Table,
  TableHeadProps,
} from '@qovery/shared/ui'
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
    <div>
      <div className="pt-5 pb-5 flex justify-between">
        <h2 className="h5 text-text-700">Events</h2>
        <div className="flex gap-5">
          <InputSearch placeholder="Search" />
          <div className="w-[1px] h-full bg-element-light-lighter-400"></div>
          <div className="flex gap-2">
            <Button style={ButtonStyle.STROKED} className="btn--no-min-w">
              Settings
            </Button>
            <Button style={ButtonStyle.BASIC} className="btn--no-min-w">
              Export
            </Button>
          </div>
        </div>
      </div>

      <Table
        dataHead={dataHead}
        data={events}
        className="border border-element-light-lighter-400 rounded"
        classNameHead="rounder-tl rounder-tr"
      >
        <>
          {isLoading ? (
            <>
              {placeholderEvents?.map((event) => (
                <RowEventFeature key={event.timestamp} event={event} nbCols={dataHead.length} isPlaceholder />
              ))}
            </>
          ) : events && events.length === 0 ? (
            <div className="text-center py-4 px-5">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1" data-testid="empty-webhook">
                No events found. <br /> Try to change your filters.
              </p>
            </div>
          ) : (
            events?.map((event) => <RowEventFeature key={event.timestamp} event={event} nbCols={dataHead.length} />)
          )}
        </>
      </Table>
      <Pagination
        className="mt-4"
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={nextDisabled}
        previousDisabled={previousDisabled}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

export default PageGeneral
