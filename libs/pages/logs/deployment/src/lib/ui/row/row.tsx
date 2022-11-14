import { EnvironmentLogs } from 'qovery-typescript-axios'
import { IconEnum, LogsType } from '@qovery/shared/enums'
import { CopyToClipboard, Icon, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export interface RowProps {
  data: EnvironmentLogs
  index: number
  columnsWidth: string
}

export function Row(props: RowProps) {
  const { index, data, columnsWidth } = props

  const type = data.type
  const step = data.details?.stage?.step

  const success = step === 'Deployed'
  const error = type === LogsType.ERROR || step === 'DeployedError'

  const indexClassName = `${
    error
      ? 'bg-error-500 text-text-800 group-hover:bg-error-600'
      : success
      ? 'bg-success-500 text-text-800 group-hover:bg-success-600'
      : 'bg-element-light-darker-300 text-text-400 group-hover:bg-element-light-darker-200'
  }`

  const colorsCellClassName = (white?: boolean) =>
    `${
      error
        ? 'text-error-500'
        : type === LogsType.WARNING
        ? 'text-warning-500'
        : success
        ? 'text-success-500'
        : `${white ? 'text-text-200' : 'text-element-light-lighter-800'}`
    }`

  return (
    <div
      className={`group grid w-full min-h-6 text-xs hover:bg-element-light-darker-400 ${
        error || success ? 'bg-element-light-darker-300' : ''
      } ${error ? 'row-error' : ''}`}
      style={{ gridTemplateColumns: columnsWidth }}
    >
      <div data-testid="index" className={indexClassName}>
        <div className="text-right w-10 min-w-[40px] h-6 py-1 px-2 font-code">{index + 1}</div>
      </div>
      <div data-testid="cell-date" className={`py-1 px-2 font-code shrink-0 ${colorsCellClassName()}`}>
        {dateFullFormat(data.timestamp)}
      </div>
      <div
        data-testid="cell-scope"
        className="py-1 px-2 flex text-accent2-400 font-medium shrink-0 min-w-[148px] relative after:absolute after:-right-[1px] after:top-1 after:bg-element-light-darker-100 after:w-[1px] after:h-4"
      >
        {data.details?.transmitter?.name && (
          <>
            <Icon name={IconEnum.APPLICATION} width="14" height="17" className="mr-1" />
            <Tooltip content={data.details?.transmitter?.name || ''}>
              <span className="truncate">{data.details?.transmitter?.name}</span>
            </Tooltip>
          </>
        )}
      </div>
      <div
        data-testid="cell-status"
        className={`py-1 pl-4 pr-2 text-xxs font-bold shrink-0 truncate min-w-[148px] ${
          success ? 'text-success-400' : error ? 'text-error-500' : 'text-accent2-400'
        }`}
      >
        {step}
      </div>
      <div data-testid="cell-msg" className={`py-1 pr-6 w-full font-code relative ${colorsCellClassName(true)}`}>
        <span className="whitespace-pre-wrap">
          {type === LogsType.ERROR ? data.error?.user_log_message : data.message?.safe_message}
        </span>
        <CopyToClipboard
          className="opacity-0 group-hover:opacity-100 text-white !absolute right-2 top-1"
          content={
            type === LogsType.ERROR ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)
          }
        />
      </div>
    </div>
  )
}

export default Row
