import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/domains/service-logs/feature'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, CopyToClipboardButtonIcon } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'

export interface RowDeploymentProps {
  data: EnvironmentLogs
  index: number
}

export function RowDeployment(props: RowDeploymentProps) {
  const { index, data } = props

  const { utc } = useContext(UpdateTimeContext)

  const type = (data as EnvironmentLogs).type
  const step = (data as EnvironmentLogs).details?.stage?.step

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  const indexClassName = `${
    error
      ? 'text-red-500 bg-neutral-550 group-hover:bg-neutral-650'
      : success
        ? 'text-green-500 bg-neutral-550 group-hover:bg-neutral-650'
        : 'bg-neutral-700 text-neutral-400 group-hover:bg-neutral-550'
  }`

  const colorsCellClassName = (date?: boolean) =>
    `${error ? 'text-red-500' : success ? 'text-green-500' : `${date ? 'text-neutral-100' : 'text-neutral-350'}`}`

  return (
    <div
      className={`group flex min-h-6 select-none text-xs ${
        error || success ? ' bg-neutral-550 hover:bg-neutral-600' : 'bg-neutral-700 hover:bg-neutral-650'
      } ${error ? 'row-error' : ''}`}
    >
      <div data-testid="index" className={indexClassName}>
        <div className="h-6 w-10 px-2 py-1 text-right font-code">{index + 1}</div>
      </div>
      <div
        data-testid="cell-date"
        className={`w-[158px] shrink-0 py-1 pl-2 pr-3 font-code ${colorsCellClassName()}`}
        title={dateUTCString(data.timestamp)}
      >
        {dateFullFormat(data.timestamp, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss.SS')}
      </div>
      <div
        data-testid="cell-msg"
        className={`relative w-full select-text overflow-hidden py-1 pr-6 font-code ${colorsCellClassName(true)}`}
      >
        <span className="truncate whitespace-pre-wrap break-all">
          {type === LogsType.ERROR ? (
            <Ansi>{data.error?.user_log_message}</Ansi>
          ) : (
            <Ansi>{data.message?.safe_message}</Ansi>
          )}
        </span>
        <CopyToClipboardButtonIcon
          className="!absolute right-2 top-1 text-white opacity-0 group-hover:opacity-100"
          content={error ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)}
        />
      </div>
    </div>
  )
}

export default RowDeployment
