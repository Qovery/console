import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import download from 'downloadjs'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { memo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Icon, TablePrimitives } from '@qovery/shared/ui'
import useDeploymentLogs from '../hooks/use-deployment-logs/use-deployment-logs'
import ProgressIndicator from '../progress-indicator/progress-indicator'
import ShowNewLogsButton from '../show-new-logs-button/show-new-logs-button'
import ShowPreviousLogsButton from '../show-previous-logs-button/show-previous-logs-button'
import RowDeployment from './row-deployment/row-deployment'

const { Table } = TablePrimitives

const MemoizedRowDeployment = memo(RowDeployment)

export function ListDeploymentLogs() {
  const { organizationId, projectId, environmentId, serviceId, versionId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const {
    data: logs = [],
    pauseLogs,
    setPauseLogs,
    newMessagesAvailable,
    setNewMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
  } = useDeploymentLogs({
    organizationId,
    projectId,
    environmentId,
    serviceId,
    versionId,
  })

  const columnHelper = createColumnHelper<EnvironmentLogs>()

  const table = useReactTable({
    data: logs,
    columns: [columnHelper.accessor('timestamp', {}), columnHelper.accessor('message', {})],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-[calc(100vh-112px)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1 pt-0">
      <div className="relative h-full border border-neutral-500 bg-neutral-600">
        <div className="flex h-12 w-full items-center justify-between border-b border-neutral-500 px-4 py-2.5">
          <div></div>
          <Button
            onClick={() => download(JSON.stringify(logs), `data-${Date.now()}.json`, 'text/json;charset=utf-8')}
            size="sm"
            variant="surface"
            color="neutral"
            className="w-7 justify-center"
          >
            <Icon iconName="file-arrow-down" iconStyle="regular" />
          </Button>
        </div>
        <div
          className="h-full w-full overflow-y-scroll pb-8"
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
          <ShowPreviousLogsButton
            showPreviousLogs={showPreviousLogs}
            setShowPreviousLogs={setShowPreviousLogs}
            setPauseLogs={setPauseLogs}
          />
          <Table.Root className="w-full text-xs">
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => (
                <MemoizedRowDeployment key={row.id} {...row} />
              ))}
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

export default ListDeploymentLogs
