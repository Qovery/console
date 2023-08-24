import { type ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
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
      ? 'bg-red-500 text-neutral-800 group-hover:bg-red-600'
      : success
      ? 'bg-green-500 text-neutral-800 group-hover:bg-green-600'
      : 'bg-neutral-600 text-neutral-350 group-hover:bg-neutral-550'
  }`

  const colorsCellClassName = (white?: boolean) =>
    `${
      type === LogsType.ERROR
        ? 'text-red-500'
        : type === LogsType.WARNING
        ? 'text-yellow-500'
        : success
        ? 'text-green-500'
        : `${white ? 'text-neutral-100' : 'text-neutral-350'}`
    }`

  return (
    <div
      className={`group flex justify-between min-h-6 font-code text-xs hover:bg-neutral-650 select-none ${
        realError || success ? 'bg-neutral-600' : ''
      } ${realError ? 'row-error' : ''}`}
    >
      <div className="flex">
        <div data-testid="index" className={indexClassName}>
          <div className="text-right w-10 min-w-[40px] h-6 py-1 px-2">{index + 1}</div>
        </div>
        <div data-testid="cell-date" className={`py-1 px-2 ${colorsCellClassName()}`}>
          {firstDate && dateDifference(new Date(data.timestamp as string), firstDate)}
        </div>
        <div data-testid="cell-msg" className={`py-1 w-11/12 select-text ${colorsCellClassName(true)}`}>
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
