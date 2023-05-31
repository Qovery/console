import { OrganizationEventResponse } from 'qovery-typescript-axios'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  DatePicker,
  Icon,
  IconAwesomeEnum,
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
  onChangeTimestamp: (startDate: Date, endDate?: Date) => void
  isOpenTimestamp: boolean
  setIsOpenTimestamp: (isOpen: boolean) => void
  nextDisabled?: boolean
  previousDisabled?: boolean
  onPageSizeChange?: (pageSize: string) => void
  pageSize?: string
}

export function PageGeneral({
  isLoading,
  events,
  onNext,
  onPrevious,
  onPageSizeChange,
  nextDisabled,
  previousDisabled,
  pageSize,
  placeholderEvents,
  onChangeTimestamp,
  isOpenTimestamp,
  setIsOpenTimestamp,
}: PageGeneralProps) {
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

  const columnsWidth = '13% 12% 12% 15% 15% 22% 10%'

  return (
    <>
      <div className="py-6 flex justify-between">
        <h2 className="h4 text-text-700">Audit Logs</h2>
      </div>
      <div className="flex items-center mb-4">
        <p className="text-text-400 text-ssm font-medium mr-1.5">Select</p>
        <DatePicker onChange={onChangeTimestamp} isOpen={isOpenTimestamp}>
          <Button
            onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
            style={ButtonStyle.STROKED}
            size={ButtonSize.TINY}
            iconRight={IconAwesomeEnum.SQUARE_PLUS}
          >
            Timeframe
          </Button>
        </DatePicker>
      </div>

      <Table
        dataHead={dataHead}
        data={events}
        className="border border-element-light-lighter-400 rounded"
        classNameHead="rounded-t"
        columnsWidth={columnsWidth}
      >
        <div>
          {isLoading ? (
            placeholderEvents?.map((event) => (
              <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} isPlaceholder />
            ))
          ) : events && events.length === 0 ? (
            <div className="text-center py-4 px-5">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1" data-testid="empty-result">
                No events found. <br /> Try to change your filters.
              </p>
            </div>
          ) : (
            events?.map((event) => <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />)
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
