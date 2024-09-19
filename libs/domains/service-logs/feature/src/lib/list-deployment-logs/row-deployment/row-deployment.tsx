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

export function RowDeployment({ id, original }: RowDeploymentProps) {
  const { utc } = useContext(UpdateTimeContext)

  const step = original.details?.stage?.step
  const type = original.type

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  const cellColors = (date = false) => {
    if (error) return 'text-red-500'
    if (success) return 'text-green-500'
    return date ? 'text-neutral-100' : 'text-neutral-350'
  }

  return (
    <Table.Row
      className={clsx('group flex min-h-6 select-none text-xs', {
        'bg-neutral-550 hover:bg-neutral-600': error || success,
        'bg-neutral-700 hover:bg-neutral-650': !error && !success,
      })}
    >
      <Table.Cell
        className={clsx(
          'h-6 w-10  bg-neutral-700 px-2 py-1 text-right font-code text-neutral-400 group-hover:bg-neutral-550',
          {
            'bg-neutral-550 text-red-500 group-hover:bg-neutral-650': error,
            'bg-neutral-550 text-green-500 group-hover:bg-neutral-650': success,
          }
        )}
      >
        {id + 1}
      </Table.Cell>
      <Table.Cell className={`h-fit w-[158px] shrink-0 py-1 pl-2 pr-3 font-code ${cellColors()}`}>
        <span title={dateUTCString(original.timestamp)}>
          {dateFullFormat(original.timestamp, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss.SS')}
        </span>
      </Table.Cell>
      <Table.Cell className={`relative h-6 w-full select-text overflow-hidden py-1 pr-6 font-code ${cellColors(true)}`}>
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
