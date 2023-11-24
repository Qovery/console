import {
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
import type {
  ApplicationGitRepository,
  ContainerResponse,
  Database,
  HelmResponseAllOfSourceOneOf1Repository,
} from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
// XXX: Those ButtonsActions should live in domains/services
// We ignore implicitDependencies in project.json to avoid circular dependencies
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ApplicationButtonsActions, DatabaseButtonsActions } from '@qovery/shared/console-shared'
import {
  IconEnum,
  ServiceTypeEnum,
  getServiceType,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  EmptyState,
  Icon,
  IconAwesomeEnum,
  StatusChip,
  TablePrimitives,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { twMerge } from '@qovery/shared/util-js'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { useServices } from '../hooks/use-services/use-services'
import { LastCommitAuthor } from '../last-commit-author/last-commit-author'
import { LastCommit } from '../last-commit/last-commit'
import { ServiceLinksPopover } from '../service-links-popover/service-links-popover'
import { ServiceListFilter } from './service-list-filter'
import { ServiceListSkeleton } from './service-list-skeleton'

const { Table } = TablePrimitives

export interface ServiceListProps extends ComponentProps<typeof Table.Root> {
  organizationId: string
  projectId: string
  environmentId: string
}

export function ServiceList({ organizationId, projectId, environmentId, className, ...props }: ServiceListProps) {
  const { data: services = [], isLoading: isServicesLoading } = useServices({ environmentId })
  const { data: environment, isLoading: isEnvironmentLoading } = useEnvironment({ environmentId })
  const [sorting, setSorting] = useState<SortingState>([])
  const navigate = useNavigate()

  const columnHelper = createColumnHelper<(typeof services)[number]>()
  const columns = useMemo(
    () => [
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
                <Icon
                  name={
                    serviceType === 'APPLICATION' || serviceType === 'CONTAINER'
                      ? IconEnum.APPLICATION
                      : getServiceType(service as ApplicationEntity)
                  }
                  width="20"
                />
                {value}
              </span>
            )
          },
        },
        cell: (info) => {
          const serviceName = info.getValue()
          const service = info.row.original
          const { serviceType } = service

          if (!environment) {
            return null
          }

          const buttonActions = match(serviceType)
            .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', () => (
              <ApplicationButtonsActions
                application={service as ApplicationEntity}
                environmentMode={environment.mode}
                clusterId={environment.cluster_id}
              />
            ))
            .with('DATABASE', () => (
              <DatabaseButtonsActions
                database={service as DatabaseEntity}
                environmentMode={environment.mode}
                clusterId={environment.cluster_id}
              />
            ))
            .exhaustive()

          return (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-4 font-medium text-sm text-neutral-400">
                <Icon
                  name={
                    serviceType === 'APPLICATION' || serviceType === 'CONTAINER'
                      ? IconEnum.APPLICATION
                      : getServiceType(service as ApplicationEntity)
                  }
                  width="20"
                />
                {serviceName}
                <div onClick={(e) => e.stopPropagation()}>
                  <ServiceLinksPopover
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    serviceId={service.id}
                    align="start"
                  >
                    <Button className="items-center gap-1" size="xs" variant="surface" color="neutral" radius="full">
                      <Icon name={IconAwesomeEnum.LINK} />
                      <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
                    </Button>
                  </ServiceLinksPopover>
                </div>
              </span>
              <div className="flex items-center gap-4">
                {'auto_deploy' in service && service.auto_deploy && (
                  <Tooltip content="Auto-deploy">
                    <span>
                      <Icon className="text-neutral-300" name={IconAwesomeEnum.ARROWS_ROTATE} />
                    </span>
                  </Tooltip>
                )}
                <div onClick={(e) => e.stopPropagation()}>{buttonActions}</div>
              </div>
            </div>
          )
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
          return (
            <Button
              className="text-xs gap-2"
              size="md"
              color="neutral"
              variant="outline"
              radius="full"
              onClick={(e) => {
                e.stopPropagation()
                navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(service.id))
              }}
            >
              <StatusChip status={service.runningStatus?.state} />
              {value}
            </Button>
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
            <Button
              className="text-xs gap-2"
              size="md"
              color="neutral"
              variant="outline"
              radius="full"
              onClick={(e) => {
                e.stopPropagation()
                navigate(
                  ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(service.id)
                )
              }}
            >
              <StatusChip status={service.deploymentStatus?.state} />
              {value}
            </Button>
          )
        },
      }),
      columnHelper.accessor('version', {
        header: 'Version',
        enableColumnFilter: false,
        enableSorting: false,
        size: 20,
        cell: (info) => {
          const service = info.row.original

          const gitInfo = (
            serviceType: ServiceTypeEnum.APPLICATION | ServiceTypeEnum.JOB | ServiceTypeEnum.HELM,
            gitRepository?: ApplicationGitRepository
          ) =>
            gitRepository && (
              <div className="flex flex-row items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <LastCommitAuthor gitRepository={gitRepository} serviceId={service.id} serviceType={serviceType} />
                <div className="flex flex-col gap-1">
                  <LastCommit gitRepository={gitRepository} serviceId={service.id} serviceType={serviceType} />
                  {gitRepository.branch && (
                    <div>
                      <Badge variant="surface" size="xs" className="gap-1">
                        <Icon name={IconAwesomeEnum.CODE_BRANCH} height={14} width={14} />
                        <Truncate text={gitRepository.branch} truncateLimit={18} />
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )
          const containerInfo = (containerImage?: Pick<ContainerResponse, 'image_name' | 'tag' | 'registry'>) =>
            containerImage && (
              <div className="flex flex-col gap-1 ml-7" onClick={(e) => e.stopPropagation()}>
                <a href={containerImage.registry.url} target="_blank" rel="noopener noreferrer">
                  <Badge variant="surface" size="xs" className="items-center gap-1 capitalize">
                    <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                    <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={18} />
                  </Badge>
                </a>
                <div>
                  <Badge variant="surface" size="xs" className="gap-1">
                    <Icon width={16} name={IconEnum.CONTAINER} />
                    <Truncate text={`${containerImage.image_name}:${containerImage.tag}`} truncateLimit={35} />
                  </Badge>
                </div>
              </div>
            )

          const datasourceInfo = (datasource?: Pick<Database, 'accessibility' | 'mode' | 'type' | 'version'>) =>
            datasource && (
              <Badge size="xs" variant="surface" className="items-center gap-1 ml-7">
                <Icon name={datasource.type} className="max-w-[12px] max-h-[12px]" height={12} width={12} />
                {datasource.version}
              </Badge>
            )

          const helmInfo = (helmRepository?: HelmResponseAllOfSourceOneOf1Repository) =>
            helmRepository && (
              <div className="flex flex-col gap-1 ml-7" onClick={(e) => e.stopPropagation()}>
                <Badge variant="surface" size="xs" className="gap-1">
                  <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                  <Truncate text={(helmRepository.repository?.name ?? '').toLowerCase()} truncateLimit={18} />
                </Badge>
                <div>
                  <Badge variant="surface" size="xs" className="gap-1">
                    <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                    {helmRepository.chart_name}:{helmRepository.chart_version}
                  </Badge>
                </div>
              </div>
            )

          // XXX: there is bug in ts-pattern where pattern matching against discriminated union + P.when doesn't work as expected
          // so JOB and HELM case should be tackle independantly
          const cell = match(service)
            .with(
              {
                serviceType: ServiceTypeEnum.JOB,
              },
              (service) =>
                match(service)
                  .with(
                    {
                      source: P.when(isJobGitSource),
                    },
                    ({ source: { docker } }) => gitInfo(service.serviceType, docker?.git_repository)
                  )
                  .with(
                    {
                      source: P.when(isJobContainerSource),
                    },
                    ({ source: { image } }) => containerInfo(image)
                  )
                  .otherwise(() => null)
            )
            .with({ serviceType: ServiceTypeEnum.APPLICATION }, ({ serviceType, git_repository }) =>
              gitInfo(serviceType, git_repository)
            )
            .with({ serviceType: ServiceTypeEnum.CONTAINER }, ({ image_name, tag, registry }) =>
              containerInfo({ image_name, tag, registry })
            )
            .with({ serviceType: ServiceTypeEnum.DATABASE }, ({ accessibility, mode, type, version }) =>
              datasourceInfo({ accessibility, mode, type, version })
            )
            .with({ serviceType: ServiceTypeEnum.HELM }, (service) =>
              match(service)
                .with(
                  {
                    source: P.when(isHelmGitSource),
                  },
                  ({ source: { git } }) => gitInfo(service.serviceType, git?.git_repository)
                )
                .with(
                  {
                    source: P.when(isHelmRepositorySource),
                  },
                  ({ source: { repository } }) => helmInfo(repository)
                )
                .otherwise(() => null)
            )
            .otherwise(() => null)

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
            <Tooltip content={dateFullFormat(value)}>
              <span className="text-xs text-neutral-350">{timeAgo(new Date(value))}</span>
            </Tooltip>
          ) : (
            <Icon name={IconAwesomeEnum.CIRCLE_QUESTION} className="text-sm text-neutral-300" />
          )
        },
      }),
    ],
    [columnHelper, environment, organizationId, projectId, environmentId, navigate]
  )

  const table = useReactTable({
    data: services,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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

  if ((services.length === 0 && isServicesLoading) || isEnvironmentLoading) {
    return <ServiceListSkeleton />
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No service found"
        description="You can create a service from the button on the top"
        className="bg-white rounded-t-sm mt-2 pt-10"
        imageWidth="w-[160px]"
      />
    )
  }

  return (
    <Table.Root className={twMerge('w-full text-xs min-w-[800px] table-auto', className)} {...props}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeaderCell
                className="first:border-r font-medium"
                key={header.id}
                style={{ width: `${header.getSize()}%` }}
              >
                {header.column.getCanFilter() ? (
                  <ServiceListFilter column={header.column} />
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
                      .with('asc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_DOWN} />)
                      .with('desc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_UP} />)
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
              className="hover:bg-neutral-100 h-16 cursor-pointer"
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
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id} className="first:border-r" style={{ width: `${cell.column.getSize()}%` }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default ServiceList
