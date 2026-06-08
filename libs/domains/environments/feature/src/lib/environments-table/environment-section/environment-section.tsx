import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum, type EnvironmentOverviewResponse, StateEnum } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { match } from 'ts-pattern'
import { ClusterAvatar } from '@qovery/domains/clusters/feature'
import { Button, Checkbox, DeploymentAction, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { MenuManageDeployment, MenuOtherActions } from '../../environment-action-toolbar/environment-action-toolbar'
import EnvironmentMode from '../../environment-mode/environment-mode'
import EnvironmentStateChip from '../../environment-state-chip/environment-state-chip'
import useEnvironments from '../../hooks/use-environments/use-environments'
import { isArgoCdEnvironment } from '../../utils/argocd'

const { Table } = TablePrimitives

export const environmentTableGridLayoutClassName =
  'grid w-full grid-cols-[44px_minmax(280px,2fr)_minmax(220px,1.4fr)_minmax(240px,1.2fr)_minmax(140px,1fr)_96px]'
export const environmentSelectionCellClassName = 'flex h-full items-center pl-4'
export const environmentNameCellContentClassName =
  'flex h-full min-w-0 flex-col justify-center gap-1 py-2 pl-0 pr-4 xl:flex-row xl:items-center xl:justify-between xl:gap-2'
export const environmentTableCellClassName = 'h-auto border-l border-neutral py-2'

function DisabledManageDeploymentButton({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <div>
        <Button aria-label="Manage Deployment" color="neutral" variant="outline" size="sm" iconOnly disabled>
          <div className="flex h-full w-full items-center justify-center gap-1.5">
            <Icon iconName="rocket" />
          </div>
        </Button>
      </div>
    </Tooltip>
  )
}

function EnvRow({
  overview,
  checked,
  onCheckedChange,
}: {
  overview: EnvironmentOverviewResponse
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: environments = [] } = useEnvironments({ projectId, suspense: true })
  const environment = environments.find((env) => env.id === overview.id)
  const isEnvironmentManagedByArgoCd = isArgoCdEnvironment(overview)
  const lastOperationDate = overview.deployment_status?.last_deployment_date
  const stopRowNavigation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  const handleNavigate = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId',
      params: { organizationId, projectId, environmentId: overview.id },
    })
  }

  return (
    <Table.Row
      key={overview.id}
      tabIndex={0}
      role="link"
      className={twMerge(
        'w-full hover:cursor-pointer hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle',
        environmentTableGridLayoutClassName
      )}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleNavigate()
      }}
    >
      <Table.Cell className="h-auto border-none p-0">
        <label className={environmentSelectionCellClassName} onClick={stopRowNavigation} onKeyDown={stopRowNavigation}>
          <Checkbox
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              if (checked === 'indeterminate') {
                return
              }
              onCheckedChange(checked)
            }}
          />
        </label>
      </Table.Cell>
      <Table.Cell className={twMerge(environmentTableCellClassName, 'border-none p-0')}>
        <div className={environmentNameCellContentClassName}>
          <div className="flex min-w-0 items-center gap-1.5">
            <Link
              to="/organization/$organizationId/project/$projectId/environment/$environmentId"
              params={{ organizationId, projectId, environmentId: overview.id }}
              onClick={stopRowNavigation}
              onKeyDown={stopRowNavigation}
              className="group min-w-0 max-w-full"
            >
              <Tooltip content={overview.name}>
                <span className="block min-w-0 truncate text-sm font-medium group-hover:underline">
                  {overview.name}
                </span>
              </Tooltip>
            </Link>
            {isEnvironmentManagedByArgoCd ? (
              <span className="flex h-4 items-center rounded-sm border border-argocd-subtle bg-surface-argocd-subtle px-0.5 text-2xs font-bold uppercase text-argocd retina:border-[0.5px]">
                ArgoCD
              </span>
            ) : null}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="font-normal text-neutral-subtle">
              {overview.services_overview.service_count}{' '}
              {pluralize(overview.services_overview.service_count, 'service')}
            </span>
            <EnvironmentStateChip mode="running" environmentId={overview.id} />
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className={environmentTableCellClassName}>
        <div className="flex h-full items-center justify-between">
          <div className="flex flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            {overview.services_overview.service_count === 0 ? (
              <span className="text-sm text-neutral-subtle">No services yet</span>
            ) : lastOperationDate ? (
              <>
                <DeploymentAction status={overview.deployment_status?.last_deployment_state} />
                <span className="text-neutral-subtle">{timeAgo(new Date(lastOperationDate))} ago</span>
              </>
            ) : (
              <span className="text-sm text-neutral-subtle">No operation detected</span>
            )}
          </div>
          <EnvironmentStateChip mode="last-deployment" environmentId={overview.id} variant="monochrome" />
        </div>
      </Table.Cell>
      <Table.Cell className={environmentTableCellClassName}>
        <div className="flex h-full items-center justify-between">
          {overview.cluster && (
            <Link
              to="/organization/$organizationId/cluster/$clusterId/overview"
              params={{ organizationId, clusterId: overview.cluster.id }}
              onClick={stopRowNavigation}
              onKeyDown={stopRowNavigation}
              className="group min-w-0 lg:inline-flex lg:items-center lg:gap-2"
            >
              <ClusterAvatar cluster={overview.cluster} size="sm" className="hidden lg:inline-block" />
              <Tooltip content={overview.cluster.name}>
                <span className="block min-w-0 truncate group-hover:underline">{overview.cluster.name}</span>
              </Tooltip>
            </Link>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className={environmentTableCellClassName}>
        <div className="flex h-full items-center">{timeAgo(new Date(overview.updated_at ?? Date.now()))} ago</div>
      </Table.Cell>
      <Table.Cell className={environmentTableCellClassName}>
        <div
          className="flex h-full items-center justify-end gap-1.5"
          onClick={stopRowNavigation}
          onKeyDown={stopRowNavigation}
        >
          {environment && (
            <>
              {isEnvironmentManagedByArgoCd ? (
                <DisabledManageDeploymentButton tooltip="ArgoCD environments can only be deployed from ArgoCD" />
              ) : overview.services_overview.service_count > 0 && overview.deployment_status ? (
                <MenuManageDeployment environment={environment} deploymentStatus={overview.deployment_status} />
              ) : (
                <DisabledManageDeploymentButton tooltip="Add at least one service to deploy this environment" />
              )}
              <MenuOtherActions
                environment={environment}
                state={overview.deployment_status?.last_deployment_state ?? StateEnum.READY}
                isArgoCdEnvironment={isEnvironmentManagedByArgoCd}
              />
            </>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export function EnvironmentSection({
  type,
  items,
  onCreateEnvClicked,
  selectedEnvironmentIds = [],
  onEnvironmentSelectionChange,
  onSectionSelectionChange,
}: {
  type: EnvironmentModeEnum
  items: EnvironmentOverviewResponse[]
  onCreateEnvClicked?: () => void
  selectedEnvironmentIds?: string[]
  onEnvironmentSelectionChange?: (environmentId: string, checked: boolean) => void
  onSectionSelectionChange?: (environmentIds: string[], checked: boolean) => void
}) {
  const title = match(type)
    .with('PRODUCTION', () => 'Production')
    .with('STAGING', () => 'Staging')
    .with('DEVELOPMENT', () => 'Development')
    .with('PREVIEW', () => 'Ephemeral')
    .exhaustive()

  const EmptyState = () =>
    match(type)
      .with(EnvironmentModeEnum.PREVIEW, () => {
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-neutral-subtle">No ephemeral environment configured</span>
            <span className="text-sm text-neutral-subtle">
              An ephemeral environment will be created automatically when a pull request is opened.
            </span>
          </div>
        )
      })
      .otherwise(() => {
        return (
          <>
            <span className="text-sm text-neutral-subtle">No {title.toLowerCase()} environment created yet</span>
            <Button size="md" variant="outline" onClick={onCreateEnvClicked}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              Create
            </Button>
          </>
        )
      })

  const selectedEnvironmentIdsSet = new Set(selectedEnvironmentIds)
  const selectedItemsCount = items.filter(({ id }) => selectedEnvironmentIdsSet.has(id)).length
  const isAllRowsSelected = selectedItemsCount === items.length && items.length > 0
  const sectionChecked = selectedItemsCount > 0 && !isAllRowsSelected ? 'indeterminate' : isAllRowsSelected

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <EnvironmentMode mode={type} variant="shrink" />
        <Heading>{title}</Heading>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-8">
          <EnvironmentMode mode={type} variant="shrink" />
          <EmptyState />
        </div>
      ) : (
        <Table.Root className="w-full min-w-[1080px]" containerClassName="no-scrollbar overflow-x-auto">
          <Table.Header>
            <Table.Row className={twMerge('w-full items-center text-xs', environmentTableGridLayoutClassName)}>
              <Table.ColumnHeaderCell className="h-9 p-0 text-neutral-subtle">
                <label
                  className={environmentSelectionCellClassName}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Checkbox
                    checked={sectionChecked}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={(checked) => {
                      if (checked === 'indeterminate') {
                        return
                      }
                      onSectionSelectionChange?.(
                        items.map(({ id }) => id),
                        checked
                      )
                    }}
                  />
                </label>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-9 items-center py-0 pl-0 pr-4 text-neutral-subtle">
                Environment
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                Last operation
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                Cluster
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                Last update
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-9 items-center justify-end border-l border-neutral text-left text-neutral-subtle">
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body className="divide-y divide-neutral">
            {items.map((environmentOverview) => (
              <EnvRow
                key={environmentOverview.id}
                overview={environmentOverview}
                checked={selectedEnvironmentIdsSet.has(environmentOverview.id)}
                onCheckedChange={(checked) => onEnvironmentSelectionChange?.(environmentOverview.id, checked)}
              />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Section>
  )
}
