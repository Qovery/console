import { type ServiceInfraLogResponseDto } from 'qovery-ws-typescript-axios'
import { useContext } from 'react'
import { Ansi, Badge, TablePrimitives } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { type LogType } from '../../hooks/use-service-logs/use-service-logs'
import { UpdateTimeContext } from '../../update-time-context/update-time-context'

const { Table } = TablePrimitives

export interface RowInfraLogsProps {
  data: ServiceInfraLogResponseDto & { type: LogType; id: number }
  enabled: boolean
  hasMultipleContainers: boolean
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function RowInfraLogs({ data, enabled, hasMultipleContainers }: RowInfraLogsProps) {
  const { utc } = useContext(UpdateTimeContext)

  if (!enabled) return null

  return (
    <Table.Row className="relative mt-0.5 text-xs before:absolute before:left-0.5 before:top-1 before:block before:h-[calc(100%-4px)] before:w-1 before:bg-neutral-500 before:content-[''] hover:bg-neutral-700">
      <Table.Cell className="flex h-9 select-none items-center gap-2 pl-9 pr-1.5 align-top">
        <Badge variant="outline" color="neutral" className="font-code">
          NGINX
        </Badge>
      </Table.Cell>
      <Table.Cell className="h-9 select-none px-1.5 align-baseline font-code font-bold text-neutral-300">
        <span title={dateUTCString(data.created_at)} className="inline-block whitespace-nowrap">
          {dateFullFormat(data.created_at, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
        </span>
      </Table.Cell>
      {/* Cell is necessary to avoid unesthetic margins */}
      {hasMultipleContainers && <Table.Cell className="flex h-0 w-0 p-0"></Table.Cell>}
      <Table.Cell className="h-9 pb-1 pl-1.5 pr-3 pt-2.5 align-top font-code font-bold text-white">
        <Ansi className="relative w-full select-text whitespace-pre-wrap break-all pr-6 text-neutral-50">
          {data.message}
        </Ansi>
      </Table.Cell>
    </Table.Row>
  )
}

export default RowInfraLogs
