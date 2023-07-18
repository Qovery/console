import { OrganizationEventOrigin, OrganizationEventResponse, OrganizationEventType } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction } from 'react'
import { EventQueryParams } from '@qovery/domains/event'
import {
  HelpSection,
  Icon,
  IconAwesomeEnum,
  Pagination,
  Table,
  TableFilterProps,
  TableHeadProps,
} from '@qovery/shared/ui'
import CustomFilterFeature from '../../feature/custom-filter-feature/custom-filter-feature'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
  queryParams: EventQueryParams
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
  setFilter,
  filter,
  handleClearFilter,
  queryParams,
}: PageGeneralProps) {
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

  return (
    <>
      <div className="px-5">
        <div className="py-6 flex justify-between">
          <h2 className="h5 text-text-700">Audit Logs</h2>
        </div>
        <div className="flex items-center mb-4 h-9">
          <CustomFilterFeature queryParams={queryParams} handleClearFilter={handleClearFilter} />
        </div>

        <Table
          dataHead={dataHead}
          data={events}
          filter={filter}
          setFilter={setFilter}
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
