import { type Row } from '@tanstack/react-table'
import clsx from 'clsx'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, TablePrimitives } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { UpdateTimeContext } from '../../update-time-context/update-time-context'

const { Table } = TablePrimitives

export interface RowDeploymentProps extends Row<EnvironmentLogs> {}

export function RowDeployment({ index, original }: RowDeploymentProps) {
  const { utc } = useContext(UpdateTimeContext)

  const step = original.details?.stage?.step
  const type = original.type

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  return (
    <Table.Row className="group mb-0.5 flex min-h-6 select-none bg-neutral-600 text-xs hover:bg-neutral-550">
      <Table.Cell className="h-6 w-10 py-1 pl-2 pr-1 text-left font-code font-bold text-neutral-300 group-hover:bg-neutral-550">
        {index + 1}
      </Table.Cell>
      <Table.Cell className="h-fit shrink-0 py-1 pl-2 pr-3 font-code font-bold text-neutral-300">
        <span title={dateUTCString(original.timestamp)}>
          {dateFullFormat(original.timestamp, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss.SS')}
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

export default RowDeployment
