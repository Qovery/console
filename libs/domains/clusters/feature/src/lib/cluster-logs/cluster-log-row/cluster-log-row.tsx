import clsx from 'clsx'
import { type ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { CopyToClipboardButtonIcon } from '@qovery/shared/ui'
import { dateDifference, dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { twMerge } from '@qovery/shared/util-js'

export interface ClusterLogRowProps {
  data: ClusterLogs
  index: number
  firstDate?: Date
}

export function ClusterLogRow({ index, data, firstDate }: ClusterLogRowProps) {
  const type = data.type
  const success = data.step === ClusterLogsStepEnum.CREATED
  const realError =
    data.step === ClusterLogsStepEnum.DELETE_ERROR ||
    data.step === ClusterLogsStepEnum.PAUSE_ERROR ||
    data.step === ClusterLogsStepEnum.CREATE_ERROR

  const indexClassName = clsx({
    'group-hover:bg-surface-negative-componentHover bg-surface-negative-component text-neutral':
      type === LogsType.ERROR && realError,
    'group-hover:bg-surface-positive-componentHover bg-surface-positive-component text-neutral':
      success && !(type === LogsType.ERROR && realError),
    'bg-surface-neutral-subtle text-neutral-subtle group-hover:bg-surface-neutral-componentHover':
      !success && !(type === LogsType.ERROR && realError),
  })

  const colorsCellClassName = () =>
    clsx({
      'text-negative': type === LogsType.ERROR,
      'text-warning': type === LogsType.WARNING,
      'text-positive': success && type !== LogsType.ERROR && type !== LogsType.WARNING,
    })

  return (
    <div
      className={twMerge(
        clsx('group flex min-h-6 select-none justify-between font-code text-xs hover:bg-surface-neutral-subtle', {
          'bg-surface-positive-subtle text-positive': success,
          'bg-surface-negative-component text-neutralInvert': realError,
        })
      )}
    >
      <div className="flex">
        <div data-testid="index" className={indexClassName}>
          <div className="h-6 w-10 min-w-[40px] px-2 py-1 text-right">{index + 1}</div>
        </div>
        <div data-testid="cell-date" className={twMerge('px-2 py-1', colorsCellClassName())}>
          {firstDate && dateDifference(new Date(data.timestamp as string), firstDate)}
        </div>
        <div data-testid="cell-msg" className={twMerge('w-11/12 select-text py-1', colorsCellClassName())}>
          <span className="font-bold">{data.step} - </span>
          <span className="whitespace-pre-wrap">
            {type === LogsType.ERROR ? data.error?.user_log_message : data.message?.safe_message}
          </span>
        </div>
      </div>
      <div className={twMerge('flex whitespace-nowrap px-2 py-1', colorsCellClassName())}>
        <CopyToClipboardButtonIcon
          className="mr-4 text-neutral opacity-0 group-hover:opacity-100"
          content={
            type === LogsType.ERROR ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)
          }
        />
        {data.timestamp && (
          <span title={dateUTCString(data.timestamp)}>
            {dateFullFormat(data.timestamp, undefined, 'dd MMM, HH:mm:ss.SS')}
          </span>
        )}
      </div>
    </div>
  )
}

export default ClusterLogRow
