import { type Organization, type OrganizationEventResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import { type ValidTargetIds } from '@qovery/domains/audit-logs/data-access'
import {
  Heading,
  type NavigationLevel,
  Pagination,
  Section,
  type SelectedItem,
  type TableFilterProps,
  TablePrimitives,
} from '@qovery/shared/ui'
import { RowItem } from '../row-item/row-item'

const { Table } = TablePrimitives

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
  organizationId: string
  targetTypeSelectedItems: SelectedItem[]
  setTargetTypeSelectedItems: Dispatch<SetStateAction<SelectedItem[]>>
  targetTypeNavigationStack?: NavigationLevel[]
  targetTypeLevel?: number
  validTargetIds?: ValidTargetIds
}

export function PageGeneral({
  events,
  onNext,
  onPrevious,
  onPageSizeChange,
  nextDisabled,
  previousDisabled,
  pageSize,
}: PageGeneralProps) {
  return (
    <Section className="grow p-8">
      <Heading level={1} className="mb-4">
        Audit logs
      </Heading>
      {/*<div className="flex items-start">
        <FilterSection
          clearFilter={handleClearFilter}
          setFilter={setFilter}
          targetTypeSelectedItems={targetTypeSelectedItems}
        />
      </div>*/}

      <Table.Root className="divide-neutral divide-y">
        <Table.Header>
          <Table.Row className="font-code text-xs">
            <Table.ColumnHeaderCell className="border-neutral h-9 border-r">Timestamp</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="border-neutral h-9 border-r font-normal">Event</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="border-neutral h-9 border-r font-normal ">
              Target type
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="border-neutral h-9 border-r font-normal">Target</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="border-neutral h-9 border-r font-normal">User</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 text-right font-normal">Source</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body className="divide-neutral divide-y">
          {events?.map((event) => <RowItem key={event.timestamp} event={event} />)}
        </Table.Body>
      </Table.Root>

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
