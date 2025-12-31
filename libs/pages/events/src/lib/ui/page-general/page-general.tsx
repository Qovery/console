import { subDays } from 'date-fns'
import {
  type Organization,
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { DecodedValueMap, useQueryParams } from 'use-query-params'
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
import { SelectedTimestamps } from '../../../../../../shared/ui/src/lib/components/table/table-head-datepicker/table-head-datepicker'
import { queryParamsValues } from '../../feature/page-general-feature/page-general-feature'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'
import FilterSection from '../filter-section/filter-section'

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

// Calculate default timestamps for display (not stored in URL)
function getDefaultTimestamps(
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  organization?: Organization
): SelectedTimestamps {
  const fromTimestamp = queryParams.fromTimestamp && new Date(parseInt(queryParams.fromTimestamp, 10) * 1000)
  const toTimestamp = queryParams.toTimestamp && new Date(parseInt(queryParams.toTimestamp, 10) * 1000)

  // If timestamps are in URL, use them
  if (fromTimestamp && toTimestamp) {
    return {
      automaticallySelected: false,
      fromTimestamp,
      toTimestamp,
    }
  }

  // If organization has >30 days retention and no URL params, select 30-day old period by default
  if (organization) {
    const retentionDays = organization.organization_plan?.audit_logs_retention_in_days ?? 30
    if (retentionDays > 30) {
      const now = new Date()
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      // Subtract 29 days to get exactly 30 days inclusive (today + 29 previous days = 30 days)
      const startDate = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0), 29)
      return {
        automaticallySelected: true,
        fromTimestamp: startDate,
        toTimestamp: endDate,
      }
    }
  }

  return {
    automaticallySelected: false,
    fromTimestamp: undefined,
    toTimestamp: undefined,
  }
}
// ---------------------------------------------

function createTableDataHead(
  timestamps: SelectedTimestamps,
  organization?: Organization
): TableHeadProps<OrganizationEventResponse>[] {
  // Calculate retention days and determine if we need to enforce 30-day limit
  const retentionDays = organization?.organization_plan?.audit_logs_retention_in_days ?? 30
  const maxRangeInDays = retentionDays > 30 ? 30 : undefined

  const dataHead: TableHeadProps<OrganizationEventResponse>[] = [
    {
      title: 'Timestamp',
      className: 'pl-9',
      datePickerData: {
        maxRangeInDays: maxRangeInDays,
        retentionDays: retentionDays,
        timestamps: timestamps,
      },
    },
    {
      title: 'Event',
      filter: [
        {
          title: 'Filter by event',
          key: 'event_type',
          itemsCustom: Object.keys(OrganizationEventType).map((item) => item),
          hideFilterNumber: true,
          search: true,
          sortAlphabetically: true,
        },
      ],
    },
    {
      title: 'Target',
    },
    {
      title: 'Target type',
      filter: [
        {
          title: 'Filter by target type',
          key: 'target_type',
          itemsCustom: Object.keys(OrganizationEventTargetType).map((item) => item),
          hideFilterNumber: true,
          search: true,
          sortAlphabetically: true,
        },
      ],
    },
    {
      title: 'User',
      filter: [
        {
          title: 'Filter by user',
          key: 'triggered_by',
          hideFilterNumber: true,
          search: true,
          sortAlphabetically: true,
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
          search: true,
          sortAlphabetically: true,
        },
      ],
      classNameTitle: 'justify-end',
    },
  ]
  return dataHead
}

const columnsWidth = '18% 15% 25% 15% 15% 12%'

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
  const [expandedEventTimestamp, setExpandedEventTimestamp] = useState<string | null>(null)

  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const timestamps = getDefaultTimestamps(queryParams, organization)
  const dataHead = createTableDataHead(timestamps, organization)

  return (
    <Section className="grow p-8">
      <h3>Audit logs</h3>
      <div className="mb-4 flex h-9 items-center">
        <FilterSection clearFilter={handleClearFilter} queryParams={queryParams} setFilter={setFilter} />
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
              <RowEventFeature
                key={event.timestamp}
                event={event}
                columnsWidth={columnsWidth}
                isPlaceholder
                expandedEventTimestamp={expandedEventTimestamp}
                setExpandedEventTimestamp={setExpandedEventTimestamp}
              />
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
                <RowEventFeature
                  key={event.timestamp}
                  event={event}
                  columnsWidth={columnsWidth}
                  expandedEventTimestamp={expandedEventTimestamp}
                  setExpandedEventTimestamp={setExpandedEventTimestamp}
                />
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
            events?.map((event) => (
              <RowEventFeature
                key={event.timestamp}
                event={event}
                columnsWidth={columnsWidth}
                expandedEventTimestamp={expandedEventTimestamp}
                setExpandedEventTimestamp={setExpandedEventTimestamp}
              />
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
