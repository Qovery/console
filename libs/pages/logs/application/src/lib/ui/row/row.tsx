import { Log } from 'qovery-typescript-axios'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

// import { CopyToClipboard } from '@qovery/shared/ui'

const getColorByPod = (pod?: string) => {
  const COLORS = [
    '#FFF',
    '#FFC312',
    '#0652DD',
    '#17C0EB',
    '#12CBC4',
    '#D980FA',
    '#FDA7DF',
    '#B53471',
    '#9980FA',
    '#C4E538',
    '#FFB8B8',
  ]

  if (!pod) return COLORS[0]

  const hashString = (string: string) => {
    let hash = 0
    if (string.length === 0) return hash
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  const stringToColor = (string: string) => COLORS[Math.abs(hashString(string) % COLORS.length)]

  return stringToColor(pod)
}

export interface RowProps {
  data: Log
  index: number
}

export function Row(props: RowProps) {
  const { index, data } = props

  return (
    <div
      className={`application-log  group flex justify-between min-h-6 font-code text-xs hover:bg-element-light-darker-400`}
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
          style={{ color: getColorByPod(data.pod_name) }}
        >
          {data.pod_name?.substring(0, 10)}...{data.pod_name?.slice(-10)}
        </div>
        <div data-testid="cell-date" className="py-3 px-4 text-element-light-lighter-700 whitespace-nowrap">
          {dateFullFormat(data.created_at)}
        </div>
        <div data-testid="cell-msg" className="py-3 px-4 w-10/12 text-text-100">
          <span className="whitespace-pre-wrap break-all">{data.message}</span>
        </div>
      </div>
      <div className="flex whitespace-nowrap py-3 px-4 text-text-100 pr-5">
        {/* <CopyToClipboard
          className="opacity-0 group-hover:opacity-100 mr-4 text-white"
          content={
            type === LogsType.ERROR ? (data.error?.user_log_message as string) : (data.message?.safe_message as string)
          }
        /> */}
        {data.version && (
          <span>
            <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-1" />
            {data.version?.substring(0, 6)}
          </span>
        )}
      </div>
    </div>
  )
}

export default Row
