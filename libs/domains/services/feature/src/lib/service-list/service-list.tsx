import {
  type RowSelectionState,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { PostHogFeature } from 'posthog-js/react'
import type {
  ApplicationGitRepository,
  ContainerResponse,
  Database,
  Environment,
  HelmResponseAllOfSourceOneOf1Repository,
} from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { type AnyService, type Application, type Helm, type Job } from '@qovery/domains/services/data-access'
import {
  IconEnum,
  ServiceTypeEnum,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  ExternalLink,
  Icon,
  Link,
  Menu,
  MenuAlign,
  type MenuData,
  StatusChip,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { containerRegistryKindToIcon, formatCronExpression, twMerge } from '@qovery/shared/util-js'
import { useServices } from '../hooks/use-services/use-services'
import { LastCommitAuthor } from '../last-commit-author/last-commit-author'
import { LastCommit } from '../last-commit/last-commit'
import { ServiceActionToolbar } from '../service-action-toolbar/service-action-toolbar'
import { ServiceLinksPopover } from '../service-links-popover/service-links-popover'
import { ServiceListActionBar } from './service-list-action-bar'
import { ServiceListSkeleton } from './service-list-skeleton'

const { Table } = TablePrimitives

function getServiceIcon(service: AnyService) {
  return match(service)
    .with({ serviceType: 'HELM' }, () => IconEnum.HELM)
    .with({ serviceType: 'DATABASE' }, () => IconEnum.DATABASE)
    .with({ serviceType: 'JOB' }, (s) => (s.job_type === 'LIFECYCLE' ? IconEnum.LIFECYCLE_JOB : IconEnum.CRON_JOB))
    .otherwise(() => IconEnum.APPLICATION)
}

function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between">
      <span className="flex min-w-0 items-center gap-4 text-sm font-medium text-neutral-400">
        <Icon name={getServiceIcon(service)} width="20" />
        {match(service)
          .with({ serviceType: 'DATABASE' }, (db) => {
            return (
              <span className="flex min-w-0 shrink flex-col truncate pr-2">
                <span className="truncate">
                  <Truncate text={service.name} truncateLimit={90} />
                </span>
                <span className="text-xs font-normal text-neutral-350">
                  {match(db.mode)
                    .with('CONTAINER', () => 'Container DB')
                    .with('MANAGED', () => 'Cloud Managed DB')
                    .exhaustive()}
                </span>
              </span>
            )
          })
          .with({ serviceType: 'JOB' }, (job) => (
            <span className="flex min-w-0 shrink flex-col truncate pr-2">
              <span className="truncate">
                <Truncate text={service.name} truncateLimit={90} />
              </span>
              <span className="text-xs font-normal text-neutral-350">
                {match(job)
                  .with(
                    { job_type: 'CRON' },
                    ({ schedule }) =>
                      `${formatCronExpression(schedule.cronjob?.scheduled_at)} (${schedule.cronjob?.timezone})`
                  )
                  .with(
                    { job_type: 'LIFECYCLE' },
                    ({ schedule }) =>
                      [schedule.on_start && 'Start', schedule.on_stop && 'Stop', schedule.on_delete && 'Delete']
                        .filter(Boolean)
                        .join(' - ') || undefined
                  )
                  .exhaustive()}
              </span>
            </span>
          ))
          .otherwise(() => (
            <span className="flex min-w-0 shrink flex-col truncate pr-2">
              <span className="truncate">
                <Truncate text={service.name} truncateLimit={90} />
              </span>
            </span>
          ))}
        <div onClick={(e) => e.stopPropagation()}>
          <ServiceLinksPopover
            organizationId={environment.organization.id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={service.id}
            align="start"
          >
            <Button size="xs" variant="surface" color="neutral" radius="full">
              <Tooltip content="Links">
                <div className="flex items-center gap-1">
                  <Icon iconName="link" />
                  <Icon iconName="angle-down" />
                </div>
              </Tooltip>
            </Button>
          </ServiceLinksPopover>
        </div>
      </span>
      <div className="flex shrink-0 items-center gap-4">
        {'auto_deploy' in service && service.auto_deploy && (
          <Tooltip content="Auto-deploy">
            <span>
              <Icon className="text-neutral-300" iconName="arrows-rotate" />
            </span>
          </Tooltip>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <ServiceActionToolbar
            serviceId={service.id}
            environment={environment}
            shellAction={match(service)
              .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => undefined)
              .with(
                { serviceType: 'DATABASE', mode: 'CONTAINER' },
                () => () =>
                  navigate(
                    DATABASE_URL(environment.organization.id, environment.project.id, environment.id, service.id) +
                      DATABASE_GENERAL_URL,
                    {
                      state: {
                        hasShell: true,
                      },
                    }
                  )
              )
              .otherwise(
                () => () =>
                  navigate(
                    APPLICATION_URL(environment.organization.id, environment.project.id, environment.id, service.id) +
                      APPLICATION_GENERAL_URL,
                    {
                      state: {
                        hasShell: true,
                      },
                    }
                  )
              )}
          />
        </div>
      </div>
    </div>
  )
}

export interface ServiceListProps extends ComponentProps<typeof Table.Root> {
  environment: Environment
}

export function ServiceList({ environment, className, ...props }: ServiceListProps) {
  const {
    id: environmentId,
    project: { id: projectId },
    organization: { id: organizationId },
  } = environment
  const { data: services = [], isLoading: isServicesLoading } = useServices({ environmentId })
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const navigate = useNavigate()

  const columnHelper = createColumnHelper<(typeof services)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <div className="h-5">
            {/** XXX: fix css weird 1px vertical shift when checked/unchecked **/}
            <Checkbox
              checked={
                table.getIsSomeRowsSelected()
                  ? table.getIsAllRowsSelected()
                    ? true
                    : 'indeterminate'
                  : table.getIsAllRowsSelected()
              }
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                table.toggleAllRowsSelected(checked)
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <label className="absolute inset-y-0 left-0 flex items-center p-4" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                row.toggleSelected(checked)
              }}
            />
          </label>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 40,
        meta: {
          customFacetEntry({ value, row }) {
            const service = row?.original
            const serviceType = service?.serviceType
            if (!serviceType) {
              return null
            }
            return (
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon name={getServiceIcon(service)} width="20" />
                {value}
              </span>
            )
          },
        },
        cell: (info) => {
          return <ServiceNameCell service={info.row.original} environment={environment} />
        },
      }),
      columnHelper.accessor('runningStatus.stateLabel', {
        id: 'runningStatus',
        header: 'Service status',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => {
          const value = info.getValue()
          const service = info.row.original
          const link = match(service)
            .with(
              { serviceType: ServiceTypeEnum.DATABASE },
              ({ id }) => DATABASE_URL(organizationId, projectId, environmentId, id) + DATABASE_GENERAL_URL
            )
            .otherwise(({ id }) => APPLICATION_URL(organizationId, projectId, environmentId, id) + SERVICES_GENERAL_URL)
          return (
            <Tooltip content="See overview">
              <Link
                as="button"
                to={link}
                onClick={(e) => e.stopPropagation()}
                className="gap-2 whitespace-nowrap text-sm"
                size="md"
                color="neutral"
                variant="outline"
                radius="full"
              >
                <StatusChip status={service.runningStatus?.state} />
                {value}
              </Link>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('deploymentStatus.stateLabel', {
        id: 'deploymentStatus',
        header: 'Last deployment',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => {
          const value = info.getValue()
          const service = info.row.original
          return (
            <Tooltip content="See logs">
              <Link
                as="button"
                to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(service.id)}
                onClick={(e) => e.stopPropagation()}
                className="gap-2 whitespace-nowrap text-sm"
                size="md"
                color="neutral"
                variant="outline"
                radius="full"
              >
                <StatusChip status={service.deploymentStatus?.state} />
                {value}
              </Link>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('version', {
        header: 'Target version',
        enableColumnFilter: false,
        enableSorting: false,
        size: 20,
        cell: (info) => {
          const service = info.row.original

          const gitInfo = (service: Application | Job | Helm, gitRepository?: ApplicationGitRepository) =>
            gitRepository && (
              <div className="flex flex-row items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <LastCommitAuthor
                  gitRepository={gitRepository}
                  serviceId={service.id}
                  serviceType={service.serviceType}
                />
                <div className="flex flex-col gap-1">
                  <LastCommit gitRepository={gitRepository} service={service} />
                  {gitRepository.branch && gitRepository.url && (
                    <span className="inline-block">
                      <ExternalLink
                        as="button"
                        href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
                        onClick={(e) => e.stopPropagation()}
                        color="neutral"
                        variant="surface"
                        size="xs"
                        className="gap-1 whitespace-nowrap"
                      >
                        <Icon iconName="code-branch" height={14} width={14} />
                        <Truncate text={gitRepository.branch} truncateLimit={18} />
                      </ExternalLink>
                    </span>
                  )}
                </div>
              </div>
            )
          const containerInfo = (containerImage?: Pick<ContainerResponse, 'image_name' | 'tag' | 'registry'>) =>
            containerImage && (
              <div className="ml-7 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <span className="inline-block">
                  <ExternalLink
                    as="button"
                    href={containerImage.registry.url}
                    onClick={(e) => e.stopPropagation()}
                    color="neutral"
                    variant="surface"
                    size="xs"
                    className="items-center gap-1 whitespace-nowrap capitalize"
                  >
                    <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                    <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={18} />
                  </ExternalLink>
                </span>
                <div>
                  <Badge variant="surface" size="xs" className="gap-1 whitespace-nowrap">
                    <Icon width={16} name={IconEnum.CONTAINER} />
                    <Truncate text={`${containerImage.image_name}:${containerImage.tag}`} truncateLimit={35} />
                  </Badge>
                </div>
              </div>
            )

          const datasourceInfo = (datasource?: Pick<Database, 'accessibility' | 'mode' | 'type' | 'version'>) =>
            datasource && (
              <Badge size="xs" variant="surface" className="ml-7 items-center gap-1 whitespace-nowrap">
                <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
                {datasource.version}
              </Badge>
            )

          const helmInfo = (helmRepository?: HelmResponseAllOfSourceOneOf1Repository) =>
            helmRepository && (
              <div className="ml-7 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <span className="inline-block">
                  <ExternalLink
                    as="button"
                    href={helmRepository.repository?.url}
                    onClick={(e) => e.stopPropagation()}
                    color="neutral"
                    variant="surface"
                    size="xs"
                    className="items-center gap-1 whitespace-nowrap"
                  >
                    <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                    <Truncate text={(helmRepository.repository?.name ?? '').toLowerCase()} truncateLimit={18} />
                  </ExternalLink>
                </span>
                <div>
                  <Badge variant="surface" size="xs" className="gap-1 whitespace-nowrap">
                    <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                    {helmRepository.chart_name}:{helmRepository.chart_version}
                  </Badge>
                </div>
              </div>
            )

          const cell = match({ service })
            .with(
              { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobGitSource) }) },
              ({ service }) => {
                const {
                  source: { docker },
                } = service
                return gitInfo(service, docker?.git_repository)
              }
            )
            .with(
              { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobContainerSource) }) },
              ({
                service: {
                  source: { image },
                },
              }) => containerInfo(image)
            )
            .with({ service: { serviceType: 'APPLICATION' } }, ({ service }) =>
              gitInfo(service, service.git_repository)
            )
            .with({ service: { serviceType: 'CONTAINER' } }, ({ service: { image_name, tag, registry } }) =>
              containerInfo({ image_name, tag, registry })
            )
            .with({ service: { serviceType: 'DATABASE' } }, ({ service: { accessibility, mode, type, version } }) =>
              datasourceInfo({ accessibility, mode, type, version })
            )
            .with(
              { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmGitSource) }) },
              ({ service }) => {
                const {
                  source: { git },
                } = service
                return gitInfo(service, git?.git_repository)
              }
            )
            .with(
              { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmRepositorySource) }) },
              ({
                service: {
                  source: { repository },
                },
              }) => helmInfo(repository)
            )
            .exhaustive()
          return cell
        },
      }),
      columnHelper.accessor('updated_at', {
        header: 'Last update',
        enableColumnFilter: false,
        enableSorting: true,
        size: 10,
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <Tooltip content={dateUTCString(value)}>
              <span className="text-xs text-neutral-350">{timeAgo(new Date(value))}</span>
            </Tooltip>
          ) : (
            <Icon iconName="circle-question" className="text-sm text-neutral-300" />
          )
        },
      }),
    ],
    [columnHelper, organizationId, projectId, environmentId, navigate]
  )

  const table = useReactTable({
    data: services,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  const newServicesMenu: MenuData = [
    {
      items: [
        {
          name: 'Create application',
          contentLeft: <Icon iconName="layer-group" className="text-sm text-brand-500" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`)
          },
        },
        {
          name: 'Create database',
          contentLeft: <Icon iconName="database" className="text-sm text-brand-500" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`)
          },
        },
        {
          name: 'Create lifecycle job',
          contentLeft: (
            <Icon name={IconEnum.LIFECYCLE_JOB_STROKE} width="14" height="16" className="text-sm text-brand-500" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_LIFECYCLE_CREATION_URL}`)
          },
        },
        {
          name: 'Create cronjob',
          contentLeft: (
            <Icon name={IconEnum.CRON_JOB_STROKE} width="14" height="16" className="text-sm text-brand-500" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_CRONJOB_CREATION_URL}`)
          },
        },
        {
          name: 'Create helm',
          contentLeft: <Icon name={IconEnum.HELM_OFFICIAL} width="14" height="16" className="text-sm text-brand-500" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`)
          },
        },
      ],
    },
  ]

  if (services.length === 0 && isServicesLoading) {
    return <ServiceListSkeleton />
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No service found"
        description="You can create a service from the button on the top"
        className="mt-2 rounded-t-sm bg-white pt-10"
      >
        <PostHogFeature
          flag="service-dropdown-list"
          match={true}
          fallback={
            <Link
              as="button"
              size="lg"
              className="mt-5 gap-2"
              to={`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`}
            >
              New service
              <Icon iconName="circle-plus" />
            </Link>
          }
        >
          <Menu
            trigger={
              <Button size="lg" className="mt-5 gap-2">
                New service
                <Icon iconName="circle-plus" />
              </Button>
            }
            menus={newServicesMenu}
            arrowAlign={MenuAlign.CENTER}
          />
        </PostHogFeature>
      </EmptyState>
    )
  }

  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)

  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className={twMerge('w-full min-w-[800px] text-xs', className)} {...props}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`${i === 1 ? 'border-r pl-0' : ''} font-medium`}
                  key={header.id}
                  style={{ width: i === 0 ? '20px' : `${header.getSize()}%` }}
                >
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={twMerge(
                        'flex items-center gap-1',
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                        .with(false, () => null)
                        .exhaustive()}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <Table.Row
                className={twMerge(
                  'h-16 cursor-pointer hover:bg-neutral-100',
                  row.getIsSelected() ? 'bg-neutral-100' : ''
                )}
                onClick={() => {
                  const link = match(row.original)
                    .with(
                      { serviceType: ServiceTypeEnum.DATABASE },
                      ({ id }) => DATABASE_URL(organizationId, projectId, environmentId, id) + DATABASE_GENERAL_URL
                    )
                    .otherwise(
                      ({ id }) => APPLICATION_URL(organizationId, projectId, environmentId, id) + SERVICES_GENERAL_URL
                    )

                  navigate(link)
                }}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <Table.Cell
                    key={cell.id}
                    className={`${i === 1 ? 'border-r pl-0' : ''} first:relative`}
                    style={{ width: i === 0 ? '20px' : `${cell.column.getSize()}%` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
      <ServiceListActionBar
        environment={environment}
        selectedRows={selectedRows}
        resetRowSelection={() => table.resetRowSelection()}
      />
    </div>
  )
}

export default ServiceList
