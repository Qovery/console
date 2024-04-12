import { OrganizationEventOrigin, type OrganizationEventResponse, OrganizationEventType } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import {
  HelpSection,
  Icon,
  Pagination,
  Section,
  Table,
  type TableFilterProps,
  type TableHeadProps,
} from '@qovery/shared/ui'
import CustomFilterFeature from '../../feature/custom-filter-feature/custom-filter-feature'
import RowEventFeature from '../../feature/row-event-feature/row-event-feature'

export interface PageGeneralProps {
  isLoading: boolean
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
      <Section className="grow p-8">
        <div className="flex items-center mb-4 h-9">
          <CustomFilterFeature handleClearFilter={handleClearFilter} />
        </div>

        <Table
          dataHead={dataHead}
          data={events}
          filter={filter}
          setFilter={setFilter}
          className="border border-neutral-200 rounded"
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
                  <Icon iconName="wave-pulse" className="text-neutral-350" />
                  <p className="text-neutral-350 font-medium text-xs mt-1" data-testid="empty-result">
                    No events found, we retain logs for a maximum of 30 days <br /> Try to change your filters.
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
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/audit-logs/',
            linkLabel: 'How the audit logs work',
          },
        ]}
      />
    </>
  )
}

export default PageGeneral
