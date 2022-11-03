import { Log } from 'qovery-typescript-axios'
import { dateFullFormat } from '@qovery/shared/utils'

// import { CopyToClipboard } from '@qovery/shared/ui'

export interface RowProps {
  data: Log
  index: number
}

export function Row(props: RowProps) {
  const { index, data } = props

  return (
    <div
      className={`group flex justify-between min-h-6 font-code text-xs hover:bg-element-light-darker-400 bg-element-light-darker-600`}
      style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}
    >
      <div className="flex">
        <div
          data-testid="index"
          className="bg-element-light-darker-300 text-text-400 group-hover:bg-element-light-darker-200"
        >
          <div className="text-right w-10 min-w-[40px] h-6 py-3 px-4">{index + 1}</div>
        </div>
        <div
          data-testid="cell-pod-name"
          className="py-3 px-4 text-element-light-lighter-800 whitespace-nowrap relative after:absolute after:-right-[1px] after:top-2 after:bg-element-light-darker-100 after:w-[1px] after:h-5"
        >
          {data.pod_name?.substring(0, 10)}...{data.pod_name?.slice(-10)}
        </div>
        <div data-testid="cell-date" className="py-3 px-4 text-element-light-lighter-700 whitespace-nowrap">
          {dateFullFormat(data.created_at)}
        </div>
        <div data-testid="cell-msg" className="py-3 px-4 w-11/12 text-text-100">
          <span className="whitespace-pre-wrap">{data.message}</span>
        </div>
      </div>
      <div className="flex whitespace-nowrap py-3 px-4 text-element-light-lighter-800 pr-5">
        {/* <CopyToClipboard
          className="opacity-0 group-hover:opacity-100 mr-4 text-white"
          content={
            type === LogsType.ERROR ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)
          }
        /> */}
        {data.application_commit_id || '-'}
      </div>
    </div>
  )
}

export default Row
