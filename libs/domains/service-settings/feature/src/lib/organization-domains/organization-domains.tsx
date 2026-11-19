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
  InputSelect,
  LoaderSpinner,
  Pagination,
  Section,
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
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-3">
            <span className="mr-auto text-sm text-neutral-subtle">{data?.total_count ?? 0} domains</span>
            <InputSelect
              className="w-48"
              label="Project"
              value={filters.projectId}
              isClearable
              options={projects.map(({ id, name }) => ({ label: name, value: id }))}
              onChange={(value) =>
                setFilters({ ...filters, projectId: String(value || ''), environmentId: '', page: 1 })
              }
            />
            <InputSelect
              className="w-48"
              label="Environment"
              value={filters.environmentId}
              disabled={!filters.projectId}
              isClearable
              options={environments.map(({ id, name }) => ({ label: name, value: id }))}
              onChange={(value) => setFilters({ ...filters, environmentId: String(value || ''), page: 1 })}
            />
            <InputSearch
              className="w-56"
              ariaLabel="Search domains"
              placeholder="Search domains..."
              value={filters.search}
              onChange={(search) => setFilters({ ...filters, search, page: 1 })}
            />
          </div>
          {isError ? (
            <EmptyState
              icon="triangle-exclamation"
              title="Unable to load domains"
              description="Try loading your organization domains again."
            >
              <Button onClick={() => refetch()}>Retry</Button>
            </EmptyState>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <LoaderSpinner />
            </div>
          ) : !data?.results.length ? (
            <EmptyState
              icon="globe"
              title={filters.search || filters.projectId ? 'No matching domains' : 'No domains configured'}
              description="Add a custom domain to a service, or adjust your filters."
            />
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {['Domain', 'Project', 'Environment', 'Routes', 'Actions'].map((label) => (
                    <Table.ColumnHeaderCell key={label} className="border-r text-xs last:border-r-0">
                      {label}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.results.map((domain) => (
                  <OrganizationDomainRow key={`${domain.environment_id}:${domain.domain}`} domain={domain} />
                ))}
              </Table.Body>
            </Table.Root>
          )}
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
