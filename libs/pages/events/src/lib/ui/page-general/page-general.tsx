import {
  type Organization,
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { type DecodedValueMap } from 'use-query-params'
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
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import CustomFilterFeature from '../../feature/custom-filter-feature/custom-filter-feature'
import { type queryParamsValues } from '../../feature/page-general-feature/page-general-feature'
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
  organizationId?: string
  queryParams?: DecodedValueMap<typeof queryParamsValues>
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
  organizationId,
  queryParams,
}: PageGeneralProps) {
  const auditLogsRetentionInDays = organization?.organization_plan?.audit_logs_retention_in_days ?? 30
  const [expandedEventTimestamp, setExpandedEventTimestamp] = useState<string | null>(null)

  return (
    <Section className="grow p-8">
      <div className="mb-4 flex h-9 items-center">
        <CustomFilterFeature handleClearFilter={handleClearFilter} />
      </div>

      {/* Active Filters Display */}
      {filter && filter.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded bg-brand-50 p-3 dark:bg-brand-900/20">
          {filter
            .filter((f) => f.value !== 'ALL')
            .map((activeFilter, index) => {
              // Handle hierarchical target_type filter - show as breadcrumb style
              if (activeFilter.key === 'target_type' && activeFilter.hierarchical) {
                const h = activeFilter.hierarchical
                const breadcrumbParts = []

                // Target Type
                if (h.targetType) {
                  const formattedType = h.targetType.charAt(0).toUpperCase() + h.targetType.slice(1).toLowerCase()
                  breadcrumbParts.push({
                    label: `Type: ${formattedType.replace(/_/g, ' ')}`,
                    onRemove: () => {
                      // Remove entire hierarchical filter
                      setFilter?.((prev) =>
                        prev.filter(
                          (f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')
                        )
                      )
                    },
                  })
                }

                // Project
                if (h.projectName) {
                  breadcrumbParts.push({
                    label: `Project: ${h.projectName}`,
                    onRemove: () => {
                      // Remove project, environment, and target
                      const newHierarchical = {
                        targetType: h.targetType,
                      }
                      setFilter?.((prev) => [
                        ...prev.filter(
                          (f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')
                        ),
                        { key: 'target_type', value: h.targetType, hierarchical: newHierarchical },
                      ])
                    },
                  })
                }

                // Environment
                if (h.environmentName) {
                  breadcrumbParts.push({
                    label: `Environment: ${h.environmentName}`,
                    onRemove: () => {
                      // Remove environment and target
                      const newHierarchical = {
                        targetType: h.targetType,
                        projectId: h.projectId,
                        projectName: h.projectName,
                      }
                      setFilter?.((prev) => [
                        ...prev.filter(
                          (f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')
                        ),
                        { key: 'target_type', value: h.targetType, hierarchical: newHierarchical },
                      ])
                    },
                  })
                }

                // Target (service/app name)
                if (h.targetName) {
                  const formattedType = h.targetType
                    ? h.targetType.charAt(0).toUpperCase() + h.targetType.slice(1).toLowerCase()
                    : ''
                  breadcrumbParts.push({
                    label: `${formattedType.replace(/_/g, ' ')}: ${h.targetName}`,
                    onRemove: () => {
                      // Remove only target
                      const newHierarchical = {
                        targetType: h.targetType,
                        projectId: h.projectId,
                        projectName: h.projectName,
                        environmentId: h.environmentId,
                        environmentName: h.environmentName,
                      }
                      setFilter?.((prev) => [
                        ...prev.filter(
                          (f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')
                        ),
                        { key: 'target_type', value: h.targetType, hierarchical: newHierarchical },
                      ])
                    },
                  })
                }

                return (
                  <div
                    key={index}
                    className="inline-flex h-7 items-center overflow-hidden rounded bg-brand-100 text-sm text-brand-500 dark:bg-brand-800 dark:text-brand-200"
                  >
                    {breadcrumbParts.map((part, partIndex) => {
                      const truncatedLabel = part.label.length > 27 ? `${part.label.substring(0, 27)}...` : part.label

                      return (
                        <div key={partIndex} className="inline-flex items-center">
                          <span className="inline-flex items-center gap-1.5 py-1 pl-2 pr-1" title={part.label}>
                            {truncatedLabel}
                            <Icon
                              iconName="xmark"
                              className="cursor-pointer text-xs hover:text-brand-600 dark:hover:text-brand-300"
                              onClick={part.onRemove}
                            />
                          </span>
                          {partIndex < breadcrumbParts.length - 1 && (
                            <Icon
                              iconName="chevron-right"
                              className="mx-0.5 text-xs text-brand-400 dark:text-brand-400"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              }

              // Handle other simple filters
              let label = ''
              if (activeFilter.key === 'event_type') {
                label = `Event: ${activeFilter.value?.replace(/_/g, ' ')}`
              } else if (activeFilter.key === 'origin') {
                label = `Source: ${activeFilter.value?.replace(/_/g, ' ')}`
              } else if (activeFilter.key === 'triggered_by') {
                label = `User: ${activeFilter.value}`
              } else {
                label = `${activeFilter.key}: ${activeFilter.value}`
              }

              return (
                <span
                  key={index}
                  className="inline-flex h-7 items-center gap-2 whitespace-nowrap rounded bg-brand-100 py-1 pl-2 pr-1 text-sm text-brand-500 dark:bg-brand-800 dark:text-brand-200"
                >
                  {label}
                  <Icon
                    iconName="xmark"
                    className="cursor-pointer hover:text-brand-600 dark:hover:text-brand-300"
                    onClick={() => {
                      // Remove this filter
                      setFilter?.((prev) => prev.filter((f) => f.key !== activeFilter.key))
                    }}
                  />
                </span>
              )
            })}
        </div>
      )}

      <Table
        dataHead={dataHead}
        data={events}
        filter={filter}
        setFilter={setFilter}
        className="rounded border border-neutral-200"
        classNameHead="rounded-t"
        columnsWidth={columnsWidth}
        organizationId={organizationId}
        queryParams={queryParams}
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
