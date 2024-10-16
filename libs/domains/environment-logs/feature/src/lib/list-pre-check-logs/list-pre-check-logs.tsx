import { type ColumnFiltersState, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { type Environment, type EnvironmentStatusesWithStagesPreCheckStage } from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LoaderSpinner, TablePrimitives } from '@qovery/shared/ui'
import { HeaderPreCheckLogs } from '../header-pre-check-logs/header-pre-check-logs'
import { type EnvironmentPreCheckLogId, usePreCheckLogs } from '../hooks/use-pre-check-logs/use-pre-check-logs'
import { RowPreCheckLogs } from './row-pre-check-logs/row-pre-check-logs'

const { Table } = TablePrimitives

const MemoizedRowPreCheckLogs = memo(RowPreCheckLogs)

export interface ListPreCheckLogsProps {
  environment: Environment
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function ListPreCheckLogs({ environment, preCheckStage }: ListPreCheckLogsProps) {
  const { organizationId, projectId, serviceId, versionId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return
  }, [])

  const { data: logs = [] } = usePreCheckLogs({
    organizationId,
    projectId,
    environmentId: environment.id,
    serviceId,
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

  const defaultColumnsFilters = useMemo(
    () => [
      {
        id: 'details.stage.step',
        value: 'ALL',
      },
    ],
    []
  )

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultColumnsFilters)

  const table = useReactTable({
    data: logs,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!logs || logs.length === 0) {
    return (
      <div className="h-full p-1">
        <div className="flex h-full w-full justify-center border border-neutral-500 bg-neutral-600 pt-11">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      </div>
    )
  }

  if (!preCheckStage) return null

  return (
    <div className="h-[calc(100vh-64px)] w-full max-w-[calc(100vw-64px)] overflow-hidden bg-neutral-900 p-1">
      <div className="relative h-full border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
        <HeaderPreCheckLogs environment={environment} preCheckStage={preCheckStage} />
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
