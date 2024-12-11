import {
  type Organization,
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import {
  Button,
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
  organizationMaxLimitReached: boolean
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

const columnsWidth = '18% 11% 10% 15% 10% 20% 16%'

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
  organizationMaxLimitReached,
}: PageGeneralProps) {
  const auditLogsRetentionInDays = organization?.organization_plan?.audit_logs_retention_in_days ?? 30

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
          ) : !organizationMaxLimitReached && events?.length === 0 ? (
            <div className="flex h-[30vh] items-center justify-center px-5 py-4 text-center">
              <div>
                <Icon iconName="wave-pulse" className="text-neutral-350" />
                <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-result">
                  No events found, we retain logs for a maximum of {auditLogsRetentionInDays} days <br /> Try to change
                  your filters.
                </p>
              </div>
            </div>
          ) : organizationMaxLimitReached ? (
            <div>
              {events?.map((event) => (
                <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />
              ))}
              <div className="flex h-14 items-center justify-center border-b border-neutral-200">
                <p className="flex items-center gap-3 text-sm text-neutral-400">
                  {auditLogsRetentionInDays} days limit reached.
                  <Button type="button" variant="outline" className="gap-1.5" onClick={() => showIntercom()}>
                    <span>Upgrade plan</span>
                    <Icon iconName="arrow-up-right-from-square" className="text-neutral-400" />
                  </Button>
                </p>
              </div>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex h-14 items-center justify-between border-b border-neutral-200 px-5 last:border-0"
                >
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {index === 0 ? (
                        <Icon iconName="lock-keyhole" iconStyle="regular" className="text-sm text-neutral-350" />
                      ) : null}
                      <Skeleton key={index} height={10} width={116} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            events?.map((event) => <RowEventFeature key={event.timestamp} event={event} columnsWidth={columnsWidth} />)
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
