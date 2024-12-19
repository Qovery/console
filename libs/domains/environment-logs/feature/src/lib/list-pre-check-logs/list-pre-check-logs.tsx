import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
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
  const { organizationId, projectId, versionId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const { data: logs = [] } = usePreCheckLogs({
    clusterId: environment.cluster_id,
    organizationId,
    projectId,
    environmentId: environment.id,
    versionId,
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
      <div className="h-full p-1">
        <HeaderPreCheckLogs preCheckStage={preCheckStage} />
        <div className="flex h-[calc(100%-44px)] w-full flex-col items-center justify-center gap-5 border border-t-0 border-neutral-500 bg-neutral-600 pt-11">
          <LoaderDots />
          <p className="text-neutral-300">Pre-check logs are loading…</p>
        </div>
      </div>
    )
  }

  if (!preCheckStage) return null

  return (
    <div className="h-[calc(100vh-64px)] w-full max-w-[calc(100vw-64px)] overflow-hidden bg-neutral-900 p-1">
      <div className="relative h-full border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
        <HeaderPreCheckLogs preCheckStage={preCheckStage}>
          <Indicator
            align="start"
            side="left"
            className="left-[3px] top-[3px]"
            content={
              environmentStatus?.last_deployment_state.includes('ERROR') && (
                <span className="flex h-3 w-3 items-center justify-center rounded bg-red-500 text-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2" height="8" fill="none" viewBox="0 0 2 8">
                    <path
                      fill="#fff"
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
              variant="surface"
              to={
                ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
                ENVIRONMENT_STAGES_URL(versionId)
              }
            >
              Go to pipeline
              <Icon iconName="timeline" />
            </Link>
          </Indicator>
        </HeaderPreCheckLogs>
        <div className="max-h-[calc(100vh-170px)] w-full overflow-y-scroll pb-12" ref={refScrollSection}>
          <Table.Root className="w-full text-xs">
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
