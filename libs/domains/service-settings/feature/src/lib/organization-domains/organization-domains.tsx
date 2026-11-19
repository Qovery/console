import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import {
  type ColumnDef,
  type ColumnFiltersState,
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
  EmptyState,
  Heading,
  Icon,
  LoaderSpinner,
  Pagination,
  Section,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  useModal,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { OrganizationDomainCreateModal } from './organization-domain-create-modal'
import { OrganizationDomainRow } from './organization-domain-row'

const { Table } = TablePrimitives

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
  const [filters, setFilters] = useState({ projectId: '', environmentId: '', search: '', page: 1, pageSize: 30 })
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
  const columns = useMemo<ColumnDef<OrganizationCustomDomainResponse>[]>(
    () => [
      { id: 'domain', header: 'Domain', enableColumnFilter: false },
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
          customFilterValue: ({ filterValue }: { filterValue: string[] }) =>
            options.find((option) => option.id === filterValue[0])?.name,
        },
      })),
      { id: 'routes', header: 'Routes', enableColumnFilter: false },
      { id: 'actions', header: 'Actions', enableColumnFilter: false },
    ],
    [projects, environments]
  )
  const columnFilters: ColumnFiltersState = [
    ...(filters.projectId ? [{ id: 'projectId', value: [filters.projectId] }] : []),
    ...(filters.environmentId ? [{ id: 'environmentId', value: [filters.environmentId] }] : []),
  ]
  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    state: { columnFilters },
    onColumnFiltersChange: (updater) => {
      const nextFilters = functionalUpdate(updater, columnFilters)
      const projectId = (nextFilters.find(({ id }) => id === 'projectId')?.value as string[] | undefined)?.[0] ?? ''
      const environmentId =
        (nextFilters.find(({ id }) => id === 'environmentId')?.value as string[] | undefined)?.[0] ?? ''
      setFilters((current) => ({
        ...current,
        projectId,
        environmentId: projectId === current.projectId ? environmentId : '',
        page: 1,
      }))
    },
    getRowId: (domain) => `${domain.environment_id}:${domain.domain}`,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div className="container mx-auto mt-6 pb-10">
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
              <span className="text-xs text-neutral-subtle">{data?.total_count ?? 0} domains</span>
              <TableFilterSearch
                aria-label="Search domains"
                placeholder="Search..."
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              />
            </div>
            <Table.Root
              className="w-full min-w-[1000px] table-fixed"
              containerClassName="rounded-none border-x-0 border-b-0"
            >
              <colgroup>
                <col className="w-72" />
                <col className="w-44" />
                <col className="w-48" />
                <col />
                <col className="w-28" />
              </colgroup>
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} className="text-xs">
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeaderCell
                        key={header.id}
                        className="border-r font-medium text-neutral-subtle last:border-r-0"
                      >
                        {header.column.getCanFilter() ? (
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
                    <Table.Cell colSpan={5} className="py-8 text-center">
                      <p className="mb-3 text-sm text-neutral-subtle">Unable to load domains.</p>
                      <Button variant="outline" color="neutral" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ) : isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-12">
                      <div className="flex justify-center">
                        <LoaderSpinner />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : !data?.results.length ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-8 text-center text-sm text-neutral-subtle">
                      {filters.search || filters.projectId
                        ? 'No matching domains. Adjust your filters or search.'
                        : 'No domains configured. Add a custom domain to a service.'}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  table
                    .getRowModel()
                    .rows.map(({ id, original }) => <OrganizationDomainRow key={id} domain={original} />)
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
    </div>
  )
}
