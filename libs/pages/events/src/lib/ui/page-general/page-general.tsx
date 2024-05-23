import { OrganizationEventOrigin, type OrganizationEventResponse, OrganizationEventType } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import { Icon, Pagination, Section, Table, type TableFilterProps, type TableHeadProps } from '@qovery/shared/ui'
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
            ) : events && events.length === 0 ? (
              <div className="flex h-[30vh] items-center justify-center px-5 py-4 text-center">
                <div>
                  <Icon iconName="wave-pulse" className="text-neutral-350" />
                  <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-result">
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
          className="pb-7 pt-4"
          onPrevious={onPrevious}
          onNext={onNext}
          nextDisabled={nextDisabled}
          previousDisabled={previousDisabled}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </Section>
    </>
  )
}

export default PageGeneral
