import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Fragment, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Ansi,
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useServiceLogs } from '../hooks/use-service-logs/use-service-logs'
import { NewLogsButton } from '../new-logs-button/new-logs-button'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'

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
  } = useServiceLogs({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    serviceId,
    enabled: true,
  })

  console.log('pauseLogs: ', pauseLogs)

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
    <div className="relative h-[calc(100vh-4rem)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1">
      <div
        className="h-full w-full overflow-y-scroll bg-neutral-600"
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
        {!showPreviousLogs && (
          <button
            type="button"
            className="block w-full bg-neutral-500 py-1.5 text-center text-sm font-medium text-neutral-250 transition hover:bg-neutral-600"
            onClick={() => setShowPreviousLogs(true)}
          >
            Load previous logs
            <Icon iconName="arrow-up" className="ml-1.5" />
          </button>
        )}
        <Table.Root className="w-full table-auto text-xs">
          <Table.Body className="divide-y-0">
            {table.getRowModel().rows.map((row) => {
              const data = row.original
              const expanded = row.getIsExpanded()

              const utc = 'UTC'
              const timeZone = ''

              return (
                <Fragment key={row.id}>
                  <Table.Row
                    onClick={row.getToggleExpandedHandler()}
                    className="relative mt-0.5 text-xs before:absolute before:left-0.5 before:top-1 before:block before:h-[calc(100%-4px)] before:w-1 before:bg-neutral-500 before:content-['']"
                  >
                    <Table.Cell className="flex h-9 items-center gap-2 pr-1.5">
                      <span className="flex h-3 w-3 items-center justify-center">
                        <Icon className="text-neutral-300" iconName={expanded ? 'chevron-down' : 'chevron-right'} />
                      </span>
                      <Tooltip content={row.original.pod_name}>
                        <Button type="button" variant="surface" color="neutral" size="xs" className="gap-1.5">
                          <span className="block h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {data.pod_name.substring(data.pod_name.length - 5)}
                        </Button>
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell className="h-9 px-1.5 align-text-top font-code font-bold text-neutral-300">
                      <span title={dateUTCString(data.created_at)} className="inline-block whitespace-nowrap">
                        {dateFullFormat(data.created_at, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="flex h-9 items-center gap-2 px-1.5">
                      <Tooltip content={data.container_name}>
                        <Button
                          type="button"
                          variant="surface"
                          color="neutral"
                          size="xs"
                          className="w-full gap-1.5 whitespace-nowrap"
                        >
                          {data.container_name}
                        </Button>
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell className="h-9 px-1.5 pb-1 pt-2 align-top font-code font-bold text-white">
                      <Ansi className="relative w-full select-text whitespace-pre-wrap break-all pr-6 text-neutral-50">
                        {data.message}
                      </Ansi>
                    </Table.Cell>
                  </Table.Row>
                  {expanded && (
                    <Table.Row className="relative text-xs before:absolute before:left-0.5 before:block before:h-full before:w-1 before:bg-neutral-500 before:content-['']">
                      <Table.Cell className="py-4 pl-1" colSpan={row.getVisibleCells().length}>
                        <div className="w-full rounded border border-neutral-500 bg-neutral-550 px-4 py-2">
                          <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0 text-xs">
                            <Dt className="col-span-2 mb-1.5 select-none font-code">Podname</Dt>
                            <Dd className="mb-1.5 flex gap-1 text-sm font-medium leading-3">{data.pod_name}</Dd>
                            <Dt className="col-span-2 mb-1.5 select-none font-code">Container</Dt>
                            <Dd className="mb-1.5 flex gap-1 text-sm font-medium leading-3">{data.container_name}</Dd>
                            <Dt className="col-span-2 select-none font-code">Version</Dt>
                            <Dd className="flex gap-1 text-sm font-medium leading-3">{data.version}</Dd>
                          </Dl>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Fragment>
              )
            })}
          </Table.Body>
        </Table.Root>
        <ProgressIndicator pauseLogs={pauseLogs} message="Streaming service logs" />
      </div>
      <NewLogsButton pauseLogs={pauseLogs} setPauseLogs={setPauseLogs} newMessagesAvailable={newMessagesAvailable} />
    </div>
  )
}

export default ListServiceLogs
