import {
  type Organization,
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import {
  Icon,
  Pagination,
  Section,
  Skeleton,
  Table,
  type TableFilterProps,
  type TableHeadProps,
} from '@qovery/shared/ui'
import CustomFilterFeature from '../../feature/custom-filter-feature/custom-filter-feature'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  showIntercom: () => void
  handleClearFilter: () => void
  events?: OrganizationEventResponse[]
  placeholderEvents?: OrganizationEventResponse[]
  onNext: () => void
  onPrevious: () => void
  nextDisabled?: boolean
  previousDisabled?: boolean
  onPageSizeChange?: (pageSize: string) => void
  pageSize?: string
  setFilter?: Dispatch<SetStateAction<TableFilterProps[]>>
  filter?: TableFilterProps[]
  organization?: Organization
  showIntercom?: () => void
}

const dataHead: TableHeadProps<OrganizationEventResponse>[] = [
  {
    title: 'Timestamp',
    className: 'pl-9',
  },
  {
    title: 'Event',
    filter: [
      {
        title: 'Filter by event',
        key: 'event_type',
        itemsCustom: Object.keys(OrganizationEventType).map((item) => item),
        hideFilterNumber: true,
      },
    ],
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
    filter: [
      {
        title: 'Filter by user',
        key: 'triggered_by',
        hideFilterNumber: true,
      },
    ],
  },
  {
    title: 'Source',
    filter: [
      {
        title: 'Filter by source',
        key: 'origin',
        itemsCustom: Object.keys(OrganizationEventOrigin).map((item) => item),
        hideFilterNumber: true,
      },
    ],
  },
]

const columnsWidth = '14% 14% 12% 15% 10% 22% 11%'

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
  setFilter,
  filter,
  handleClearFilter,
  organization,
  showIntercom,
}: PageGeneralProps) {
  const auditLogsRetentionInDays = organization?.organization_plan?.audit_logs_retention_in_days ?? 30
  const currentDate = new Date().getTime()
  const retentionLimitDate = currentDate - auditLogsRetentionInDays * 24 * 60 * 60 * 1000

  const filteredEvents =
    events?.filter((event) => {
      if (!event.timestamp) return null
      return new Date(event.timestamp).getTime() >= retentionLimitDate
    }) || []

  const checkIfEventsAreFiltered = filteredEvents.length !== events?.length

  return (
    <Section className="grow p-8">
      <div className="mb-4 flex h-9 items-center">
        <CustomFilterFeature handleClearFilter={handleClearFilter} />
      </div>

      <Table
        dataHead={dataHead}
        data={events}
        filter={filter}
        setFilter={setFilter}
        className="rounded border border-neutral-200"
        classNameHead="rounded-t"
        columnsWidth={columnsWidth}
      >
        <div>
          {isLoading ? (
            placeholderEvents?.map((event) => (
              <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} isPlaceholder />
            ))
          ) : !checkIfEventsAreFiltered && events.length === 0 ? (
            <div className="flex h-[30vh] items-center justify-center px-5 py-4 text-center">
              <div>
                <Icon iconName="wave-pulse" className="text-neutral-350" />
                <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-result">
                  No events found, we retain logs for a maximum of {auditLogsRetentionInDays} days <br /> Try to change
                  your filters.
                </p>
              </div>
            </div>
          ) : checkIfEventsAreFiltered ? (
            <div>
              {filteredEvents?.map((event) => (
                <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />
              ))}
              <div className="flex h-14 items-center justify-center border-b border-neutral-200">
                <p className="flex gap-1 text-sm text-neutral-400">
                  {auditLogsRetentionInDays} days limit reached.
                  {/* TODO: add a real button */}
                  <span
                    className="cursor-pointer font-medium text-sky-500 transition-colors hover:text-sky-600"
                    onClick={() => showIntercom()}
                  >
                    Upgrade your plan to see more
                  </span>
                </p>
              </div>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex h-14 items-center justify-between border-b border-neutral-200 px-5 last:border-0"
                >
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {index === 0 ? <Icon iconName="lock-keyhole" className="text-sm text-neutral-350" /> : null}
                      <Skeleton key={index} height={10} width={116} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            filteredEvents?.map((event) => (
              <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />
            ))
          )}
        </div>
      </Table>
      <Pagination
        className="pb-20 pt-4"
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={nextDisabled}
        previousDisabled={previousDisabled}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    </Section>
  )
}

export default PageGeneral
