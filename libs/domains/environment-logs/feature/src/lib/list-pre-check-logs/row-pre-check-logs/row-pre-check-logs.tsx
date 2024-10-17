import { type Row } from '@tanstack/react-table'
import clsx from 'clsx'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, TablePrimitives } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { type EnvironmentPreCheckLogId } from '../../hooks/use-pre-check-logs/use-pre-check-logs'

const { Table } = TablePrimitives

export interface RowPreCheckLogsProps extends Row<EnvironmentPreCheckLogId> {}

export function RowPreCheckLogs({ original }: RowPreCheckLogsProps) {
  const step = original.details?.stage?.step
  const type = original.type

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  return (
    <Table.Row className="mb-0.5 flex min-h-6 select-none bg-neutral-600 text-xs hover:bg-neutral-550">
      <Table.Cell className="h-6 min-w-10 py-1 pl-2 pr-1 text-left font-code font-bold text-neutral-300 group-hover:bg-neutral-550 group-hover:delay-1000">
        <span className="relative block">{original.id}</span>
      </Table.Cell>
      <Table.Cell className="h-fit shrink-0 py-1 pl-2 pr-3 font-code font-bold text-neutral-300">
        <span title={dateUTCString(original.timestamp)}>
          {dateFullFormat(original.timestamp, 'UTC', 'dd MMM, HH:mm:ss.SS')}
        </span>
      </Table.Cell>
      <Table.Cell
        className={clsx('relative h-fit w-full select-text overflow-hidden py-1 pl-3 pr-6 font-code font-bold', {
          'text-red-500': error,
          'text-green-500': success,
          'text-white': !error && !success,
        })}
      >
        <span className="truncate whitespace-pre-wrap break-all">
          {type === LogsType.ERROR ? (
            <Ansi>{original.error?.user_log_message}</Ansi>
          ) : (
            <Ansi>{original.message?.safe_message}</Ansi>
          )}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default RowPreCheckLogs
