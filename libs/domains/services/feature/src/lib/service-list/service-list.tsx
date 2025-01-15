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
  HelmSourceRepositoryResponse,
  Status,
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
  DEPLOYMENT_LOGS_VERSION_URL,
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
  AnimatedGradientText,
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
  truncateText,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import {
  containerRegistryKindToIcon,
  formatCronExpression,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { useServices } from '../hooks/use-services/use-services'
import { LastCommit } from '../last-commit/last-commit'
import LastVersion from '../last-version/last-version'
import { ServiceActionToolbar } from '../service-action-toolbar/service-action-toolbar'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { ServiceLinksPopover } from '../service-links-popover/service-links-popover'
import { ServiceTemplateIndicator } from '../service-template-indicator/service-template-indicator'
import { ServiceListActionBar } from './service-list-action-bar'
import { ServiceListSkeleton } from './service-list-skeleton'

const { Table } = TablePrimitives

function ServiceNameCell({
  service,
  environment,
  deploymentStatus,
}: {
  service: AnyService
  environment: Environment
  deploymentStatus?: Status
}) {
  const navigate = useNavigate()

  const serviceLink = match(service)
    .with(
      { serviceType: ServiceTypeEnum.DATABASE },
      ({ id }) =>
        DATABASE_URL(environment.organization.id, environment.project.id, service.environment.id, id) +
        DATABASE_GENERAL_URL
    )
    .otherwise(
      ({ id }) =>
        APPLICATION_URL(environment.organization.id, environment.project.id, service.environment.id, id) +
        SERVICES_GENERAL_URL
    )

  const LinkDeploymentStatus = () => {
    const environmentLog = ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)
    const deploymentLog = DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus?.execution_id)
    // const precheckLog = ENVIRONMENT_PRE_CHECK_LOGS_URL(deploymentStatus?.execution_id ?? '')

    return match(deploymentStatus?.state)
      .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
        <span className="text-ssm font-normal text-neutral-350">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
      ))
      .with('CANCELED', () => <span className="text-ssm font-normal text-neutral-350">Last deployment aborted</span>)
      .with('DEPLOYING', 'RESTARTING', 'BUILDING', 'DELETING', 'CANCELING', 'STOPPING', (s) => (
        <Link
          to={environmentLog + deploymentLog}
          color="brand"
          underline
          size="ssm"
          className="group flex truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand-500">
            <span className="flex items-center gap-0.5">
              {upperCaseFirstLetter(s)}... <Icon iconName="arrow-up-right" />
            </span>
          </AnimatedGradientText>
        </Link>
      ))
      .with('DEPLOYMENT_ERROR', 'DELETE_ERROR', 'STOP_ERROR', 'RESTART_ERROR', 'BUILD_ERROR', () => (
        <Link
          // to={deploymentStatus?.steps === null ? environmentLog + precheckLog : environmentLog + deploymentLog}
          to={environmentLog + deploymentLog}
          color="red"
          underline
          size="ssm"
          className="truncate"
          onClick={(e) => e.stopPropagation()}
        >
          Last deployment failed
          <Icon iconName="arrow-up-right" className="relative top-[1px]" />
        </Link>
      ))
      .otherwise(() => null)
  }

  return (
    <div className="flex items-center justify-between">
      <span className="flex min-w-0 items-center gap-4 text-sm font-medium text-neutral-400">
        <ServiceTemplateIndicator service={service} size="sm">
          <ServiceAvatar service={service} size="sm" border="solid" />
        </ServiceTemplateIndicator>
        {match(service)
          .with({ serviceType: 'DATABASE' }, (db) => {
            return (
              <span className="flex min-w-0 shrink flex-col truncate pr-2">
                <span className="flex items-center gap-1.5">
                  <Tooltip content={db.name}>
                    <Link
                      className="inline max-w-max truncate"
                      color="current"
                      to={serviceLink}
                      underline
                      onClick={(e) => e.stopPropagation()}
                    >
                      {db.name}
                    </Link>
                  </Tooltip>
                </span>
                <LinkDeploymentStatus />
              </span>
            )
          })
          .with({ serviceType: 'JOB' }, (job) => {
            const schedule = match(job)
              .with(
                { job_type: 'CRON' },
                ({ schedule }) =>
                  `${formatCronExpression(schedule.cronjob?.scheduled_at)} (${schedule.cronjob?.timezone})`
              )
              .with(
                { job_type: 'LIFECYCLE' },
                ({ schedule }) =>
                  [schedule.on_start && 'Deploy', schedule.on_stop && 'Stop', schedule.on_delete && 'Delete']
                    .filter(Boolean)
                    .join(' - ') || undefined
              )
              .exhaustive()

            return (
              <span className="flex min-w-0 shrink flex-col truncate pr-2">
                <span className="flex items-center gap-1.5">
                  <Tooltip content={service.name}>
                    <Link
                      className="inline max-w-max truncate"
                      color="current"
                      to={serviceLink}
                      underline
                      onClick={(e) => e.stopPropagation()}
                    >
                      {service.name}
                    </Link>
                  </Tooltip>
                  <Tooltip content={schedule}>
                    <span className="truncate text-sm font-normal">
                      <Icon iconName="info-circle" iconStyle="regular" />
                    </span>
                  </Tooltip>
                </span>
                <LinkDeploymentStatus />
              </span>
            )
          })
          .otherwise(() => (
            <span className="flex min-w-0 shrink flex-col truncate pr-2">
              <Tooltip content={service.name}>
                <Link
                  className="inline max-w-max truncate"
                  color="current"
                  to={serviceLink}
                  underline
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.name}
                </Link>
              </Tooltip>
              <LinkDeploymentStatus />
            </span>
          ))}
      </span>
      <div className="flex shrink-0 items-center gap-5">
        <div className="flex items-center">
          {'auto_deploy' in service && service.auto_deploy && (
            <Tooltip content="Auto-deploy">
              <span>
                <Icon className="text-neutral-300" iconName="arrows-rotate" />
              </span>
            </Tooltip>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <ServiceLinksPopover
              organizationId={environment.organization.id}
              projectId={environment.project.id}
              environmentId={environment.id}
              serviceId={service.id}
              align="start"
            >
              <Button variant="surface" color="neutral" radius="full" className="ml-3">
                <Tooltip content="Links">
                  <div className="flex items-center gap-1">
                    <Icon iconName="link" iconStyle="regular" />
                    <Icon iconName="angle-down" />
                  </div>
                </Tooltip>
              </Button>
            </ServiceLinksPopover>
          </div>
        </div>
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
        header: 'Service',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 57,
        meta: {
          customFacetEntry({ value, row }) {
            const service = row?.original
            const serviceType = service?.serviceType
            if (!serviceType) {
              return null
            }
            return (
              <span className="flex items-center gap-2 text-sm font-medium">
                <ServiceAvatar service={service} size="xs" />
                {value}
              </span>
            )
          },
        },
        cell: (info) => {
          return (
            <ServiceNameCell
              service={info.row.original}
              deploymentStatus={info.row.original.deploymentStatus}
              environment={environment}
            />
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
                <StatusChip
                  status={match(service)
                    .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, (s) => s.deploymentStatus?.state)
                    .otherwise((s) => s.runningStatus?.state)}
                />
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
        size: 30,
        cell: (info) => {
          const service = info.row.original

          const gitInfo = (service: Application | Job | Helm, gitRepository?: ApplicationGitRepository) =>
            gitRepository && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex w-44 flex-col gap-1.5">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Icon className="h-3 w-3" name={gitRepository.provider} />
                    <ExternalLink
                      href={gitRepository.url}
                      underline
                      color="current"
                      size="ssm"
                      withIcon={false}
                      className="font-normal"
                    >
                      <Truncate text={gitRepository.name} truncateLimit={20} />
                    </ExternalLink>
                  </span>
                  {gitRepository.branch && gitRepository.url && (
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Icon iconName="code-branch" iconStyle="regular" />
                      <ExternalLink
                        href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
                        underline
                        color="current"
                        size="ssm"
                        withIcon={false}
                        className="font-normal"
                      >
                        <Truncate text={gitRepository.branch} truncateLimit={20} />
                      </ExternalLink>
                    </span>
                  )}
                </div>
                <LastCommit
                  organizationId={organizationId}
                  projectId={projectId}
                  gitRepository={gitRepository}
                  service={service}
                />
              </div>
            )
          const containerInfo = (containerImage?: Pick<ContainerResponse, 'image_name' | 'tag' | 'registry'>) =>
            containerImage && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex w-44 flex-col gap-1.5">
                  <span className="flex items-center gap-2 text-neutral-350">
                    <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                    <Tooltip
                      content={
                        <span className="text-center">
                          {containerImage.registry.name.length >= 20 && (
                            <>
                              {containerImage.registry.name} <br />
                            </>
                          )}{' '}
                          {containerImage.registry.url}
                        </span>
                      }
                    >
                      <span className="text-neutral-350">
                        {containerImage.registry.name.length >= 20
                          ? truncateText(containerImage.registry.name, 20).toLowerCase()
                          : containerImage.registry.name.toLowerCase()}
                      </span>
                    </Tooltip>
                  </span>
                  <span className="flex items-center gap-2 text-neutral-350">
                    <Icon width={16} name={IconEnum.CONTAINER} />
                    <Truncate text={`${containerImage.image_name}`} truncateLimit={20} />
                  </span>
                </div>
                {service.serviceType === 'CONTAINER' && (
                  <LastVersion
                    organizationId={organizationId}
                    projectId={projectId}
                    service={service}
                    version={containerImage.tag}
                  />
                )}
              </div>
            )

          const datasourceInfo = (datasource?: Pick<Database, 'accessibility' | 'mode' | 'type' | 'version'>) =>
            datasource && (
              <div className="flex flex-col gap-1.5 text-ssm text-neutral-350">
                <span className="flex items-center gap-2">
                  <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
                  {datasource.type.toLowerCase().replace('sql', 'SQL').replace('db', 'DB')}
                </span>
                <span className="flex items-center gap-2">
                  <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />v
                  {datasource.version}
                </span>
              </div>
            )

          const helmInfo = (helmRepository?: HelmSourceRepositoryResponse) =>
            helmRepository && (
              <div className="flex items-center gap-1">
                <div className="flex w-44 flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="flex gap-2">
                    <Icon width={12} name={IconEnum.HELM_OFFICIAL} />
                    <Tooltip
                      content={
                        <span className="text-center">
                          {helmRepository.repository?.name.length > 20 && (
                            <>
                              {helmRepository.repository?.name} <br />
                            </>
                          )}
                          {helmRepository.repository?.url}
                        </span>
                      }
                    >
                      <span className="text-neutral-350">
                        {helmRepository.repository?.name.length > 20
                          ? truncateText(helmRepository.repository?.name, 20).toLowerCase()
                          : helmRepository.repository?.name.toLowerCase()}
                      </span>
                    </Tooltip>
                  </span>
                  <div className="flex gap-2">
                    <Icon width={12} name={IconEnum.HELM_OFFICIAL} />
                    <span className="text-neutral-350">
                      <Truncate text={helmRepository.chart_name} truncateLimit={20} />
                    </span>
                  </div>
                </div>
                {service.serviceType === 'HELM' && (
                  <LastVersion
                    organizationId={organizationId}
                    projectId={projectId}
                    service={service}
                    version={helmRepository.chart_version}
                  />
                )}
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
      columnHelper.accessor('deploymentStatus.last_deployment_date', {
        header: 'Last deployment',
        enableColumnFilter: false,
        enableSorting: true,
        size: 3,
        cell: (info) => {
          const service = info.row.original
          const value = info.getValue()
          const linkLog =
            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
            DEPLOYMENT_LOGS_VERSION_URL(service?.id, service?.deploymentStatus?.execution_id)

          return value ? (
            <Link
              to={linkLog}
              className="group flex w-full translate-x-3 justify-end gap-1 text-right text-neutral-350 hover:translate-x-0 hover:text-brand-500"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip content={dateUTCString(value)} delayDuration={200}>
                <span className="whitespace-nowrap text-ssm font-normal">{timeAgo(new Date(value))}</span>
              </Tooltip>
              <Icon
                iconName="arrow-up-right"
                iconStyle="regular"
                className="text-ssm opacity-0 group-hover:opacity-100"
              />
            </Link>
          ) : (
            <span className="block w-full text-right">-</span>
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
              <Icon iconName="circle-plus" iconStyle="regular" />
            </Link>
          }
        >
          <Menu
            trigger={
              <Button size="lg" className="mt-5 gap-2">
                New service
                <Icon iconName="circle-plus" iconStyle="regular" />
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
      <Table.Root className={twMerge('w-full min-w-[1080px] overflow-x-scroll text-ssm', className)} {...props}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`px-6 ${i === 0 ? 'pl-4' : ''} ${i === 1 ? 'border-r pl-0' : ''} font-medium`}
                  key={header.id}
                  style={{ width: i === 0 ? '20px' : `${header.getSize()}%` }}
                >
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={twMerge(
                        'flex items-center gap-1 truncate',
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-ssm" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-ssm" iconName="arrow-up" />)
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
                  'h-[68px] cursor-pointer hover:bg-neutral-100',
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
                    className={`px-6 ${i === 1 ? 'border-r pl-0' : ''} first:relative`}
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
