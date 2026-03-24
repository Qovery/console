import { useParams } from '@tanstack/react-router'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { clsx } from 'clsx'
import {
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { Button, DropdownMenu, Icon, Link, LoaderDots, StatusChip, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { trimId } from '@qovery/shared/util-js'
import { HeaderPreCheckLogs } from '../header-pre-check-logs/header-pre-check-logs'
import { type EnvironmentPreCheckLogId, usePreCheckLogs } from '../hooks/use-pre-check-logs/use-pre-check-logs'
import { RowPreCheckLogs } from './row-pre-check-logs/row-pre-check-logs'

const { Table } = TablePrimitives

const MemoizedRowPreCheckLogs = memo(RowPreCheckLogs)

export interface ListPreCheckLogsProps {
  environment: Environment
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  environmentStatus?: EnvironmentStatus
}

export function ListPreCheckLogs({ environment, environmentStatus, preCheckStage }: ListPreCheckLogsProps) {
  const { organizationId = '', projectId = '', deploymentId = '' } = useParams({ strict: false })
  const refScrollSection = useRef<HTMLDivElement>(null)

  const { data: logs = [] } = usePreCheckLogs({
    clusterId: environment.cluster_id,
    organizationId,
    projectId,
    environmentId: environment.id,
    versionId: deploymentId,
  })
  const { data: environmentDeploymentHistory = [] } = useDeploymentHistory({
    environmentId: environment.id,
    suspense: true,
  })

  const columnHelper = createColumnHelper<EnvironmentPreCheckLogId>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {}),
      columnHelper.accessor('message', {}),
      columnHelper.accessor('details.stage.step', {}),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return
  }, [logs])

  if (!logs || logs.length === 0) {
    return (
      <div className="h-full">
        <HeaderPreCheckLogs preCheckStage={preCheckStage} />
        <div className="flex h-[calc(100%-44px)] w-full flex-col items-center justify-center gap-5 pt-11">
          <LoaderDots />
          <p className="text-neutral">Pre-check logs are loading…</p>
        </div>
      </div>
    )
  }

  const currentDeploymentHistory = environmentDeploymentHistory.find((d) => d.identifier.execution_id === deploymentId)
  const isLastVersion = environmentDeploymentHistory?.[0]?.identifier.execution_id === deploymentId || !deploymentId

  if (!preCheckStage) return null

  return (
    <div className="h-[calc(100vh-108px)] w-full overflow-hidden">
      <div className="relative h-full">
        <HeaderPreCheckLogs preCheckStage={preCheckStage}>
          <div className="flex items-center gap-4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline" className="gap-1.5">
                  <Icon iconName="clock-rotate-left" className="text-neutral-subtle" />
                  {isLastVersion
                    ? 'Latest'
                    : dateYearMonthDayHourMinuteSecond(
                        new Date(currentDeploymentHistory?.auditing_data.created_at ?? '')
                      )}
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="z-dropdown max-h-96 w-80 overflow-y-auto">
                {environmentDeploymentHistory.map((deployment) => (
                  <DropdownMenu.Item
                    asChild
                    key={deployment.identifier.execution_id}
                    className={clsx('min-h-9', {
                      'bg-surface-brand-component': deployment.identifier.execution_id === deploymentId,
                    })}
                  >
                    <Link
                      className="flex w-full justify-between"
                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs"
                      params={{
                        organizationId,
                        projectId,
                        environmentId: environment.id,
                        deploymentId: deployment.identifier.execution_id,
                      }}
                      replace={true}
                    >
                      <Tooltip content={deployment.identifier.execution_id}>
                        <span>{trimId(deployment.identifier.execution_id ?? '')}</span>
                      </Tooltip>
                      <span className="flex items-center gap-2.5 text-xs text-neutral-subtle">
                        {dateYearMonthDayHourMinuteSecond(new Date(deployment.auditing_data.created_at))}
                        <StatusChip status={deployment.status} />
                      </span>
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </HeaderPreCheckLogs>
        <div className="h-full w-full overflow-y-scroll pb-12" ref={refScrollSection}>
          <Table.Root className="w-full bg-background text-xs" containerClassName="border-none">
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => (
                <MemoizedRowPreCheckLogs key={row.id} {...row} />
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  )
}

export default ListPreCheckLogs
