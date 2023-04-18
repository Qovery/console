import { EnvironmentLogs } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/shared/console-shared'
import { LogsType } from '@qovery/shared/enums'
import { CopyToClipboard, convertToAnsi } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

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
      ? 'text-error-500 bg-element-light-darker-200 group-hover:bg-element-light-darker-400'
      : success
      ? 'text-success-500 bg-element-light-darker-200 group-hover:bg-element-light-darker-400'
      : 'bg-element-light-darker-500 text-text-500 group-hover:bg-element-light-darker-200'
  }`

  const colorsCellClassName = (date?: boolean) =>
    `${error ? 'text-error-500' : success ? 'text-success-500' : `${date ? 'text-text-200' : 'text-text-400'}`}`

  return (
    <div
      className={`group flex min-h-6 text-xs select-none ${
        error || success
          ? ' bg-element-light-darker-200 hover:bg-element-light-darker-300'
          : 'bg-element-light-darker-500 hover:bg-element-light-darker-400'
      } ${error ? 'row-error' : ''}`}
    >
      <div data-testid="index" className={indexClassName}>
        <div className="text-right w-10 h-6 py-1 px-2 font-code">{index + 1}</div>
      </div>
      <div data-testid="cell-date" className={`py-1 pl-2 pr-3 font-code shrink-0 w-[158px] ${colorsCellClassName()}`}>
        {dateFullFormat(data.timestamp, utc ? 'UTC' : undefined)}
      </div>
      <div
        data-testid="cell-msg"
        className={`select-text py-1 pr-6 font-code relative w-full overflow-hidden ${colorsCellClassName(true)}`}
      >
        <span className="whitespace-pre-wrap truncate break-all">
          {type === LogsType.ERROR
            ? convertToAnsi(data.error?.user_log_message)
            : convertToAnsi(data.message?.safe_message)}
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
