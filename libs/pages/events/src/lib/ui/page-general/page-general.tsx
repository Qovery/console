import { addMonths } from 'date-fns'
import { OrganizationEventResponse } from 'qovery-typescript-axios'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  DatePicker,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  Pagination,
  Table,
  TableHeadProps,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  events?: OrganizationEventResponse[]
  placeholderEvents?: OrganizationEventResponse[]
  onNext: () => void
  onPrevious: () => void
  onChangeTimestamp: (startDate: Date, endDate: Date) => void
  onChangeClearTimestamp: () => void
  timestamps?: [Date, Date]
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
  onChangeClearTimestamp,
  isOpenTimestamp,
  setIsOpenTimestamp,
  timestamps,
}: PageGeneralProps) {
  const dataHead: TableHeadProps<OrganizationEventResponse>[] = [
    {
      title: 'Timestamp',
      className: 'pl-9',
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
      <div className="px-5">
        <div className="py-6 flex justify-between">
          <h2 className="h5 text-text-700">Audit Logs</h2>
        </div>
        <div className="flex items-center mb-4">
          <p className="text-text-400 text-ssm font-medium mr-1.5">Select</p>
          <DatePicker
            onChange={onChangeTimestamp}
            isOpen={isOpenTimestamp}
            maxDate={new Date()}
            minDate={addMonths(new Date(), -1)}
            showTimeInput
          >
            {!timestamps ? (
              <Button
                className={`${isOpenTimestamp ? 'btn--active' : ''}`}
                onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
                style={ButtonStyle.STROKED}
                size={ButtonSize.TINY}
                iconRight={IconAwesomeEnum.CLOCK}
              >
                Timeframe
              </Button>
            ) : (
              <Button onClick={() => setIsOpenTimestamp(!isOpenTimestamp)} size={ButtonSize.TINY}>
                from: {dateYearMonthDayHourMinuteSecond(timestamps[0], true, false)} - to:{' '}
                {dateYearMonthDayHourMinuteSecond(timestamps[1], true, false)}
                <span
                  className="px-1 py-1 relative left-1"
                  role="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onChangeClearTimestamp()
                  }}
                >
                  <Icon name={IconAwesomeEnum.CROSS} />
                </span>
              </Button>
            )}
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
              <div className="flex items-center justify-center text-center py-4 px-5 h-[30vh]">
                <div>
                  <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
                  <p className="text-text-400 font-medium text-xs mt-1" data-testid="empty-result">
                    No events found. <br /> Try to change your filters.
                  </p>
                </div>
              </div>
            ) : (
              events?.map((event) => (
                <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />
              ))
            )}
          </div>
        </Table>
        <Pagination
          className="pt-4 pb-7"
          onPrevious={onPrevious}
          onNext={onNext}
          nextDisabled={nextDisabled}
          previousDisabled={previousDisabled}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/audit-logs/',
            linkLabel: 'How the audit logs work',
            external: true,
          },
        ]}
      />
    </>
  )
}

export default PageGeneral
