import { useParams } from '@tanstack/react-router'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Icon, Indicator, Link, LoaderDots, TablePrimitives } from '@qovery/shared/ui'
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
  const { organizationId, projectId, deploymentId } = useParams({ strict: false })
  const refScrollSection = useRef<HTMLDivElement>(null)

  const { data: logs = [] } = usePreCheckLogs({
    clusterId: environment.cluster_id,
    organizationId,
    projectId,
    environmentId: environment.id,
    versionId: deploymentId,
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

  if (!preCheckStage) return null

  return (
    <div className="h-[calc(100vh-108px)] w-full overflow-hidden">
      <div className="relative h-full">
        <HeaderPreCheckLogs preCheckStage={preCheckStage}>
          <Indicator
            align="start"
            side="left"
            className="left-[2px] top-[3px]"
            content={
              environmentStatus?.last_deployment_state.includes('ERROR') && (
                <span className="flex h-3 w-3 items-center justify-center rounded bg-surface-negative-solid text-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2" height="8" fill="none" viewBox="0 0 2 8">
                    <path
                      fill="var(--neutral-invert-12)"
                      d="M1.483.625H.517A.267.267 0 0 0 .25.892v3.716c0 .148.12.267.267.267h.966c.148 0 .267-.12.267-.267V.892a.267.267 0 0 0-.267-.267M.25 6.142v.966c0 .148.12.267.267.267h.966c.148 0 .267-.12.267-.267v-.966a.267.267 0 0 0-.267-.267H.517a.267.267 0 0 0-.267.267"
                    ></path>
                  </svg>
                </span>
              )
            }
          >
            <Link
              as="button"
              className="gap-1.5"
              variant="outline"
              to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId"
              params={{ organizationId, projectId, environmentId: environment.id, deploymentId }}
            >
              Go to pipeline
              <Icon iconName="timeline" />
            </Link>
          </Indicator>
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
