import { LogsType } from '@qovery/shared/enums'
import { CopyToClipboard } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export interface RowProps {
  data: any
  index: number
}

export function Row(props: RowProps) {
  const { index, data } = props

  const type = data.type
  const success = false
  const realError = false

  const indexClassName = `${
    type === LogsType.ERROR && realError
      ? 'bg-error-500 text-text-800 group-hover:bg-error-600'
      : success
      ? 'bg-success-500 text-text-800 group-hover:bg-success-600'
      : 'bg-element-light-darker-300 text-text-400 group-hover:bg-element-light-darker-200'
  }`

  const colorsCellClassName = (white?: boolean) =>
    `${
      type === LogsType.ERROR
        ? 'text-error-500'
        : type === LogsType.WARNING
        ? 'text-warning-500'
        : success
        ? 'text-success-500'
        : `${white ? 'text-text-200' : 'text-element-light-lighter-800'}`
    }`

  const step = data.details.stage.step

  return (
    <div
      className={`group flex w-full min-h-6 text-xs hover:bg-element-light-darker-400 ${
        realError || success ? 'bg-element-light-darker-300' : ''
      } ${realError ? 'row-error' : ''}`}
    >
      <div data-testid="index" className={indexClassName}>
        <div className="text-right w-10 min-w-[40px] h-6 py-1 px-2 font-code">{index + 1}</div>
      </div>
      <div data-testid="cell-date" className={`py-1 px-2 font-code w-[154px] shrink-0 ${colorsCellClassName()}`}>
        {dateFullFormat(data.timestamp)}
      </div>
      <div data-testid="cell-scope" className="py-1 px-2 text-accent2-400 font-medium w-[160px] shrink-0 truncate">
        {data.details.transmitter.name}
      </div>
      <div
        data-testid="cell-status"
        className={`py-1 px-2 text-xxs font-bold uppercase w-[200px] shrink-0 truncate ${
          step === 'Deployed' || step === 'Terminated' ? 'text-success-400' : 'text-accent2-400'
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
