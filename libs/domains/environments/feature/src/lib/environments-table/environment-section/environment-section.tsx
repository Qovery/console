import { Link, useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { useMediaQuery } from 'react-responsive'
import { match } from 'ts-pattern'
import { ClusterAvatar } from '@qovery/domains/clusters/feature'
import {
  ActionToolbar,
  Button,
  DeploymentAction,
  Heading,
  Icon,
  Section,
  StatusChip,
  TablePrimitives,
  Truncate,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { MenuManageDeployment, MenuOtherActions } from '../../environment-action-toolbar/environment-action-toolbar'
import EnvironmentMode from '../../environment-mode/environment-mode'
import useEnvironments from '../../hooks/use-environments/use-environments'

const { Table } = TablePrimitives

const gridLayoutClassName =
  'grid w-full grid-cols-[1fr_20%_min(20%,160px)_min(15%,120px)_max(10%,106px)] xl:grid-cols-[1fr_25%_min(20%,220px)_160px_106px]'

function EnvRow({ overview }: { overview: EnvironmentOverviewResponse }) {
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: environments = [] } = useEnvironments({ projectId, suspense: true })
  const environment = environments.find((env) => env.id === overview.id)
  const runningStatus = environment?.runningStatus
  const cellClassName = 'h-auto border-l border-neutral py-2'
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1280px)',
  })
  const isVeryLargeScreen = useMediaQuery({
    query: '(min-width: 1536px)',
  })

  return (
    <Table.Row key={overview.id} className={twMerge('w-full hover:bg-surface-neutral-subtle', gridLayoutClassName)}>
      <Table.Cell className={twMerge(cellClassName, 'border-none')}>
        <div className="flex h-full flex-col justify-center gap-1 xl:flex-row xl:items-center xl:justify-between xl:gap-2">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/"
            params={{ organizationId, projectId, environmentId: overview.id }}
            className="text-wrap break-all text-sm font-medium"
          >
            <Truncate text={overview.name} truncateLimit={isVeryLargeScreen ? 72 : isDesktopOrLaptop ? 50 : 40} />
          </Link>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="font-normal text-neutral-subtle">
              {overview.service_count} {pluralize(overview.service_count, 'service')}
            </span>
            {runningStatus && <StatusChip status={runningStatus.state} />}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className={cellClassName}>
        <div className="flex h-full items-center justify-between">
          <div className="flex flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <DeploymentAction status={overview.deployment_status?.last_deployment_state} />
            <span className="text-neutral-subtle">
              {timeAgo(new Date(overview.deployment_status?.last_deployment_date ?? Date.now()))} ago
            </span>
          </div>
          <StatusChip status={overview.deployment_status?.last_deployment_state} variant="monochrome" />
        </div>
      </Table.Cell>
      <Table.Cell className={cellClassName}>
        <div className="flex h-full items-center justify-between">
          {overview.cluster && (
            <Link
              to={`/organization/${organizationId}/cluster/${overview.cluster.id}/overview`}
              className="text-wrap break-all hover:underline lg:inline-flex lg:items-center lg:gap-2"
            >
              <ClusterAvatar cluster={overview.cluster} size="sm" className="hidden lg:inline-block" />
              <Truncate text={overview.cluster?.name} truncateLimit={isDesktopOrLaptop ? 40 : 20} />
            </Link>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className={cellClassName}>
        <div className="flex h-full items-center">{timeAgo(new Date(overview.updated_at ?? Date.now()))} ago</div>
      </Table.Cell>
      <Table.Cell className={cellClassName}>
        <div className="flex h-full items-center">
          {environment && overview.deployment_status && overview.service_count > 0 && (
            <ActionToolbar.Root>
              <MenuManageDeployment
                environment={environment}
                deploymentStatus={overview.deployment_status}
                variant="default"
              />
              <MenuOtherActions environment={environment} state={overview.deployment_status?.last_deployment_state} />
            </ActionToolbar.Root>
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
}: {
  type: EnvironmentModeEnum
  items: EnvironmentOverviewResponse[]
  onCreateEnvClicked?: () => void
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
            <Button size="md" variant="outline" className="gap-2" onClick={onCreateEnvClicked}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              Create
            </Button>
          </>
        )
      })

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <EnvironmentMode mode={type} variant="shrink" />
        <Heading level={3}>{title}</Heading>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-8">
          <EnvironmentMode mode={type} variant="shrink" />
          <EmptyState />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral">
          <Table.Root className="divide-y divide-neutral">
            <Table.Header>
              <Table.Row className={twMerge('w-full items-center text-xs', gridLayoutClassName)}>
                <Table.ColumnHeaderCell className="flex h-9 items-center text-neutral-subtle">
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
                <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-right text-neutral-subtle">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body className="divide-y divide-neutral">
              {items.map((environmentOverview) => (
                <EnvRow key={environmentOverview.id} overview={environmentOverview} />
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      )}
    </Section>
  )
}
