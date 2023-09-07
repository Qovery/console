import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/shared/console-shared'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, CopyToClipboard } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'

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
      className={`group flex min-h-6 text-xs select-none ${
        error || success ? ' bg-neutral-550 hover:bg-neutral-600' : 'bg-neutral-700 hover:bg-neutral-650'
      } ${error ? 'row-error' : ''}`}
    >
      <div data-testid="index" className={indexClassName}>
        <div className="text-right w-10 h-6 py-1 px-2 font-code">{index + 1}</div>
      </div>
      <div data-testid="cell-date" className={`py-1 pl-2 pr-3 font-code shrink-0 w-[158px] ${colorsCellClassName()}`}>
        {dateFullFormat(data.timestamp, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss:SS')}
      </div>
      <div
        data-testid="cell-msg"
        className={`select-text py-1 pr-6 font-code relative w-full overflow-hidden ${colorsCellClassName(true)}`}
      >
        <span className="whitespace-pre-wrap truncate break-all">
          {type === LogsType.ERROR ? (
            <Ansi>{data.error?.user_log_message}</Ansi>
          ) : (
            <Ansi>{data.message?.safe_message}</Ansi>
          )}
        </span>
        <CopyToClipboard
          className="opacity-0 group-hover:opacity-100 text-white !absolute right-2 top-1"
          content={error ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)}
        />
      </div>
    </div>
  )
}

export default RowDeployment
