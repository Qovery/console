import { ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { CopyToClipboard } from '@qovery/shared/ui'
import { dateDifference } from '@qovery/shared/utils'

export interface RowProps {
  data: ClusterLogs
  index: number
  firstDate?: Date
}

export function Row(props: RowProps) {
  const { index, data, firstDate } = props

  const type = data.type
  const success = data.step === ClusterLogsStepEnum.CREATED
  const realError =
    data.step === ClusterLogsStepEnum.DELETE_ERROR ||
    data.step === ClusterLogsStepEnum.PAUSE_ERROR ||
    data.step === ClusterLogsStepEnum.CREATE_ERROR

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
        : `${white ? 'text-text-200' : 'text-element-light-lighter-700'}`
    }`

  return (
    <div
      className={`group flex justify-between min-h-6 font-code text-xs hover:bg-element-light-darker-400 ${
        realError || success ? 'bg-element-light-darker-300' : ''
      } ${realError ? 'row-error' : ''}`}
    >
      <div className="flex">
        <div data-testid="index" className={indexClassName}>
          <div className="text-right w-10 min-w-[40px] h-6 py-1 px-2">{index + 1}</div>
        </div>
        <div data-testid="cell-date" className={`py-1 px-2 ${colorsCellClassName()}`}>
          {firstDate && dateDifference(new Date(data.timestamp as string), firstDate)}
        </div>
        <div data-testid="cell-msg" className={`py-1 w-11/12 ${colorsCellClassName(true)}`}>
          <span className="font-bold">{data.step} - </span>
          <span className="whitespace-pre-wrap">
            {type === LogsType.ERROR ? data.error?.user_log_message : data.message?.safe_message}
          </span>
        </div>
      </div>
      <div className={`flex whitespace-nowrap py-1 px-2 ${colorsCellClassName()}`}>
        <CopyToClipboard
          className="opacity-0 group-hover:opacity-100 mr-4 text-white"
          content={
            type === LogsType.ERROR ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)
          }
        />
        {data.timestamp}
      </div>
    </div>
  )
}

export default Row
