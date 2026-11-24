import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useParams } from '@tanstack/react-router'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type RowSelectionState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { useUserRole } from '@qovery/shared/iam/feature'
import {
  Button,
  Checkbox,
  EmptyState,
  Heading,
  Icon,
  LoaderSpinner,
  Pagination,
  Section,
  Skeleton,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { getDomainSelectionKey, getDomainTargets } from '../utils/organization-domain-targets'
import { DOMAIN_DNS_STATUSES, type DomainDnsStatus } from '../utils/summarize-domain-dns-checks'
import { OrganizationDomainActionBar } from './organization-domain-action-bar'
import { OrganizationDomainCreateModal } from './organization-domain-create-modal'
import { OrganizationDomainRow } from './organization-domain-row'
import { OrganizationDomainStatusSummary } from './organization-domain-status'
import { DOMAIN_DNS_STATUS_DISPLAY } from './organization-domain-status-badge'
import { useOrganizationDomainDnsStatuses } from './use-organization-domain-dns-statuses'

const { Table } = TablePrimitives

const route = getRouteApi('/_authenticated/organization/$organizationId/domains')

const SKELETON_ROWS = 10
const SKELETON_ROUTE_WIDTHS = [[120], [96, 112], [140], [104, 88, 120]]

function OrganizationDomainsSkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, index) => (
    <Table.Row key={index} aria-hidden="true">
      <Table.Cell className="h-12 border-r">
        <div className="flex items-center gap-3">
          <Skeleton width={14} height={14} />
          <Skeleton width={160 + ((index * 37) % 120)} height={16} />
          <Skeleton width={24} height={24} rounded />
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <Skeleton width={64} height={24} />
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <Skeleton width={72 + ((index * 23) % 48)} height={16} />
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} />
          <Skeleton width={88 + ((index * 29) % 56)} height={16} />
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-r">
        <div className="flex items-center gap-1.5">
          {SKELETON_ROUTE_WIDTHS[index % SKELETON_ROUTE_WIDTHS.length].map((width, routeIndex) => (
            <Skeleton key={routeIndex} width={width} height={24} />
          ))}
        </div>
      </Table.Cell>
      <Table.Cell className="h-12">
        <div className="flex justify-end gap-1.5">
          <Skeleton width={24} height={24} />
          <Skeleton width={24} height={24} />
          <Skeleton width={24} height={24} />
        </div>
      </Table.Cell>
    </Table.Row>
  ))
}

export function OrganizationDomains() {
  useDocumentTitle('Domains - Organization')
  const { organizationId = '' } = useParams({ strict: false })
  const { roles, loading } = useUserRole()
  const isAdmin = roles.some(
    (role) => role === `organization:${organizationId}:admin` || role === `organization:${organizationId}:owner`
  )

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner />
      </div>
    )
  if (!isAdmin)
    return (
      <EmptyState
        icon="lock"
        title="Administrator access required"
        description="Only organization administrators can view and manage organization domains."
      />
    )

  return <OrganizationDomainsContent key={organizationId} />
}

export function OrganizationDomainsContent() {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const navigate = route.useNavigate()
  const { page = 1 } = route.useSearch()
  const [filterState, setFilterState] = useState<{
    projectId: string
    environmentId: string
    search: string
    pageSize: number
    // Statuses are only known for the domains on screen, so this filter applies to the current page.
    status: DomainDnsStatus | ''
  }>({ projectId: '', environmentId: '', search: '', pageSize: 30, status: '' })
  const filters = { ...filterState, page }
  // Selection belongs to the page it was made on, including when the page changes through browser history.
  const [selection, setSelection] = useState<{ page: number; rows: RowSelectionState }>({ page, rows: {} })
  const rowSelection = selection.page === page ? selection.rows : {}
  const setRowSelection: OnChangeFn<RowSelectionState> = (updater) =>
    setSelection({ page, rows: functionalUpdate(updater, rowSelection) })
  const setFilters = (next: typeof filters | ((current: typeof filters) => typeof filters)) => {
    const { page: nextPage, ...nextFilterState } = functionalUpdate(next, filters)
    const filtersChanged = (Object.keys(nextFilterState) as (keyof typeof filterState)[]).some(
      (key) => nextFilterState[key] !== filterState[key]
    )
    if (filtersChanged) {
      setFilterState(nextFilterState)
      setRowSelection({})
    }
    if (nextPage !== page) {
      // Paging adds a history entry; resetting the page after a filter change replaces it.
      navigate({ search: (prev) => ({ ...prev, page: nextPage }), replace: filtersChanged })
    }
  }
  const { data: projects = [] } = useQuery(queries.projects.list({ organizationId }))
  const { data: environments = [] } = useQuery({
    ...queries.environments.list({ projectId: filters.projectId }),
    enabled: Boolean(filters.projectId),
  })
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    ...queries.customDomains.organizationList({
      ...filters,
      organizationId,
      projectId: filters.projectId || undefined,
      environmentId: filters.environmentId || undefined,
      search: filters.search || undefined,
    }),
    keepPreviousData: true,
  })
  const pageDomains = useMemo(() => data?.results ?? [], [data])
  // Non-blocking: rows render right away; status cells and the summary suspend on their own.
  // Domains whose checks have not settled have no status yet, so they are left out of status facets and filters.
  const { statuses, fetchingKeys, recheck } = useOrganizationDomainDnsStatuses(pageDomains)
  const getStatus = (domain: OrganizationCustomDomainResponse) => statuses.get(getDomainSelectionKey(domain))?.status
  const statusCounts = new Map<DomainDnsStatus, number>()
  pageDomains.forEach((domain) => {
    const status = getStatus(domain)
    if (status) statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
  })
  const visibleDomains = filters.status
    ? pageDomains.filter((domain) => getStatus(domain) === filters.status)
    : pageDomains
  const statusFacets = new Map(
    DOMAIN_DNS_STATUSES.filter((status) => statusCounts.has(status)).map((status) => [
      status as string,
      statusCounts.get(status) ?? 0,
    ])
  )
  // Not memoized: the status facets change with every DNS check result.
  const columns: ColumnDef<OrganizationCustomDomainResponse>[] = [
    { id: 'domain', header: 'Domain', enableColumnFilter: false },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (domain) => getStatus(domain) ?? null,
      meta: {
        facetedValues: statusFacets,
        customFacetEntry: ({ value }: { value: DomainDnsStatus }) => (
          <span className="min-w-0 truncate text-sm font-medium">{DOMAIN_DNS_STATUS_DISPLAY[value].label}</span>
        ),
        customFilterValue: ({ filterValue }: { filterValue: string[] }) =>
          DOMAIN_DNS_STATUS_DISPLAY[filterValue[0] as DomainDnsStatus]?.label,
      },
    },
    ...[
      { id: 'projectId', header: 'Project', options: projects },
      { id: 'environmentId', header: 'Environment', options: environments },
    ].map(({ id, header, options }) => ({
      id,
      header,
      accessorFn: (domain: OrganizationCustomDomainResponse) =>
        id === 'projectId' ? domain.project.id : domain.environment_id,
      meta: {
        facetedValues: new Map(options.map(({ id }) => [id, 1])),
        customFacetEntry: ({ value }: { value: string }) => (
          <span className="min-w-0 truncate text-sm font-medium">
            {options.find((option) => option.id === value)?.name}
          </span>
        ),
        customFilterValue: ({ filterValue }: { filterValue: string[] }) => (
          <Truncate text={options.find((option) => option.id === filterValue[0])?.name ?? ''} truncateLimit={12} />
        ),
      },
    })),
    { id: 'routes', header: 'Routes', enableColumnFilter: false },
    { id: 'actions', header: 'Actions', enableColumnFilter: false },
  ]
  const columnFilters: ColumnFiltersState = [
    ...(filters.status ? [{ id: 'status', value: [filters.status] }] : []),
    ...(filters.projectId ? [{ id: 'projectId', value: [filters.projectId] }] : []),
    ...(filters.environmentId ? [{ id: 'environmentId', value: [filters.environmentId] }] : []),
  ]
  const table = useReactTable({
    data: visibleDomains,
    columns,
    state: { columnFilters, rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => getDomainTargets(row.original).length > 0,
    onColumnFiltersChange: (updater) => {
      const nextFilters = functionalUpdate(updater, columnFilters)
      const projectId = (nextFilters.find(({ id }) => id === 'projectId')?.value as string[] | undefined)?.[0] ?? ''
      const environmentId =
        (nextFilters.find(({ id }) => id === 'environmentId')?.value as string[] | undefined)?.[0] ?? ''
      const status = ((nextFilters.find(({ id }) => id === 'status')?.value as string[] | undefined)?.[0] ?? '') as
        | DomainDnsStatus
        | ''
      setFilters((current) => {
        const nextEnvironmentId = projectId === current.projectId ? environmentId : ''
        const serverFiltersChanged = projectId !== current.projectId || nextEnvironmentId !== current.environmentId
        return {
          ...current,
          projectId,
          environmentId: nextEnvironmentId,
          status,
          page: serverFiltersChanged ? 1 : current.page,
        }
      })
    },
    getRowId: getDomainSelectionKey,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div className="container mx-auto mt-6 pb-28">
      <Section className="gap-8">
        <div className="flex items-center justify-between border-b border-neutral pb-6">
          <Heading>Domains</Heading>
          <Button
            size="md"
            onClick={() =>
              openModal({ content: <OrganizationDomainCreateModal onClose={closeModal} />, options: { width: 488 } })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            New domain
          </Button>
        </div>
        <div className="space-y-4" aria-busy={isFetching}>
          <div className="overflow-hidden rounded-lg border border-neutral">
            <div className="flex items-center justify-between gap-3 bg-surface-neutral-subtle px-4 py-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-subtle">{data?.total_count ?? 0} domains</span>
                <OrganizationDomainStatusSummary
                  domains={pageDomains}
                  status={filters.status}
                  onStatusChange={(status) => setFilters({ ...filters, status })}
                />
              </div>
              <TableFilterSearch
                aria-label="Search domains"
                placeholder="Search..."
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              />
            </div>
            <Table.Root className="w-full min-w-[1240px] table-fixed" containerClassName="rounded-none border-0">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[140px]" />
                <col className="w-[180px]" />
                <col className="w-[200px]" />
                <col />
                <col className="w-[118px]" />
              </colgroup>
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} className="text-xs">
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeaderCell
                        key={header.id}
                        className="border-r font-medium text-neutral-subtle last:border-r-0"
                      >
                        {header.column.id === 'domain' ? (
                          <div className="flex items-center gap-3">
                            <Checkbox
                              aria-label="Select all domains on this page"
                              className="h-3.5 w-3.5"
                              checked={
                                table.getIsAllPageRowsSelected()
                                  ? true
                                  : table.getIsSomePageRowsSelected()
                                    ? 'indeterminate'
                                    : false
                              }
                              disabled={isFetching || !table.getRowModel().rows.some((row) => row.getCanSelect())}
                              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
                            />
                            Domain
                          </div>
                        ) : header.column.getCanFilter() ? (
                          <TableFilter
                            column={header.column}
                            multiple={false}
                            disabled={header.column.id === 'environmentId' && !filters.projectId}
                          />
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {isError ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="py-8 text-center">
                      <p className="mb-3 text-sm text-neutral-subtle">Unable to load domains.</p>
                      <Button variant="outline" color="neutral" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ) : isLoading ? (
                  <OrganizationDomainsSkeletonRows />
                ) : !visibleDomains.length ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="py-8 text-center text-sm text-neutral-subtle">
                      {filters.status && pageDomains.length
                        ? `No ${DOMAIN_DNS_STATUS_DISPLAY[filters.status].label.toLowerCase()} domains on this page.`
                        : filters.search || filters.projectId
                          ? 'No matching domains. Adjust your filters or search.'
                          : filters.page > 1
                            ? 'No domains on this page.'
                            : 'No domains configured. Add a custom domain to a service.'}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <OrganizationDomainRow
                        key={row.id}
                        domain={row.original}
                        selected={row.getIsSelected()}
                        selectionDisabled={isFetching || !row.getCanSelect()}
                        dnsChecking={fetchingKeys.has(getDomainSelectionKey(row.original))}
                        onCheckDns={() => recheck(row.original)}
                        onSelectionChange={(selected) => row.toggleSelected(selected)}
                      />
                    ))
                )}
              </Table.Body>
            </Table.Root>
          </div>
          <Pagination
            pageSize={String(filters.pageSize)}
            previousDisabled={filters.page === 1 || isFetching}
            nextDisabled={isFetching || !data || filters.page * filters.pageSize >= data.total_count}
            onPrevious={() => setFilters({ ...filters, page: filters.page - 1 })}
            onNext={() => setFilters({ ...filters, page: filters.page + 1 })}
            onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize: Number(pageSize), page: 1 })}
          />
        </div>
      </Section>
      <OrganizationDomainActionBar
        domains={table.getSelectedRowModel().rows.map(({ original }) => original)}
        disabled={isFetching}
        onUnselect={() => table.resetRowSelection()}
        onDeleted={(keys) =>
          setRowSelection((current) =>
            Object.fromEntries(Object.entries(current).filter(([key]) => !keys.includes(key)))
          )
        }
      />
    </div>
  )
}
