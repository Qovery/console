import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Icon, TablePrimitives } from '@qovery/shared/ui'
import { useServiceLogs } from '../hooks/use-service-logs/use-service-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import RowInfraLogs from './row-infra-logs/row-infra-logs'
import { RowServiceLogs } from './row-service-logs/row-service-logs'

const { Table } = TablePrimitives

export interface ListServiceLogsProps {
  clusterId: string
}

export function ListServiceLogs({ clusterId }: ListServiceLogsProps) {
  const { organizationId, projectId, environmentId, serviceId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const {
    data: logs = [],
    pauseLogs,
    setPauseLogs,
    newMessagesAvailable,
    setNewMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
    enabledNginx,
    setEnabledNginx,
  } = useServiceLogs({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    serviceId,
    enabled: true,
  })

  const table = useReactTable({
    data: logs,
    columns: [
      {
        accessorKey: 'pod_name',
        header: 'Pods',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'created_at',
        header: () => 'Date',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'container_name',
        header: () => 'Container',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'message',
        header: () => 'Message',
        cell: (info) => info.getValue(),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
  })

  // Effect used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    !pauseLogs && section.scroll(0, section.scrollHeight)
  }, [logs, pauseLogs])

  return (
    <div className="h-[calc(100vh-4rem)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1">
      <div className="relative h-full border border-neutral-500 bg-neutral-600">
        <div className="h-12 w-full border-b border-neutral-500 px-4 py-2.5">
          <Button
            type="button"
            variant="surface"
            color="neutral"
            className="gap-1"
            onClick={() => setEnabledNginx(!enabledNginx)}
          >
            Nginx Logs
            <Icon iconName={enabledNginx ? 'eye-slash' : 'eye'} />
          </Button>
        </div>
        <div
          className="h-full w-full overflow-y-scroll"
          ref={refScrollSection}
          onWheel={(event) => {
            if (
              !pauseLogs &&
              refScrollSection.current &&
              refScrollSection.current.clientHeight !== refScrollSection.current.scrollHeight &&
              event.deltaY < 0
            ) {
              setPauseLogs(true)
              setNewMessagesAvailable(false)
            }
          }}
        >
          <ShowPreviousLogsButton showPreviousLogs={showPreviousLogs} setShowPreviousLogs={setShowPreviousLogs} />
          <Table.Root className="w-full table-auto text-xs">
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => {
                if (row.original.type === 'SERVICE') {
                  return (
                    <RowServiceLogs
                      key={row.id}
                      data={row.original}
                      expanded={row.getIsExpanded()}
                      toggleExpandedHandler={row.getToggleExpandedHandler()}
                      colSpanExpanded={row.getVisibleCells().length}
                    />
                  )
                } else {
                  return <RowInfraLogs key={row.id} data={row.original} />
                }
              })}
            </Table.Body>
          </Table.Root>
          <ProgressIndicator pauseLogs={pauseLogs} message="Streaming service logs" />
        </div>
        <ShowNewLogsButton
          pauseLogs={pauseLogs}
          setPauseLogs={setPauseLogs}
          newMessagesAvailable={newMessagesAvailable}
        />
      </div>
    </div>
  )
}

export default ListServiceLogs
