import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useUserRole } from '@qovery/shared/iam/feature'
import {
  Button,
  EmptyState,
  Heading,
  Icon,
  InputSearch,
  LoaderSpinner,
  Pagination,
  Section,
  TablePrimitives,
  useModal,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { OrganizationDomainCreateModal } from './organization-domain-create-modal'
import { OrganizationDomainHeaderFilter } from './organization-domain-header-filter'
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
              <InputSearch
                size="sm"
                className="w-52"
                ariaLabel="Search domains"
                placeholder="Search..."
                value={filters.search}
                onChange={(search) => setFilters({ ...filters, search, page: 1 })}
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
                <Table.Row>
                  <Table.ColumnHeaderCell className="h-11 border-r text-xs">Domain</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-11 border-r text-xs">
                    <OrganizationDomainHeaderFilter
                      label="Project"
                      value={filters.projectId}
                      options={projects}
                      onChange={(projectId) => setFilters({ ...filters, projectId, environmentId: '', page: 1 })}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-11 border-r text-xs">
                    <OrganizationDomainHeaderFilter
                      label="Environment"
                      value={filters.environmentId}
                      options={environments}
                      disabled={!filters.projectId}
                      onChange={(environmentId) => setFilters({ ...filters, environmentId, page: 1 })}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-11 border-r text-xs">Routes</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-11 text-xs">Actions</Table.ColumnHeaderCell>
                </Table.Row>
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
                  data.results.map((domain) => (
                    <OrganizationDomainRow key={`${domain.environment_id}:${domain.domain}`} domain={domain} />
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
    </div>
  )
}
