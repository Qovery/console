import { Log } from 'qovery-typescript-axios'
import { CopyToClipboard, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export const getColorByPod = (pod?: string) => {
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
}

export function Row(props: RowProps) {
  const { data } = props

  return (
    <div className="application-log group flex justify-between min-h-6 font-code text-xs hover:bg-element-light-darker-400 w-full overflow-y-auto">
      <div className="flex">
        <div
          data-testid="cell-pod-name"
          className="py-2 px-4 text-element-light-lighter-800 whitespace-nowrap relative after:absolute after:-right-[1px] after:top-2 after:bg-element-light-darker-100 after:w-[1px] after:h-5"
          style={{ color: getColorByPod(data.pod_name) }}
        >
          {data.pod_name?.substring(0, 10)}...{data.pod_name?.slice(-10)}
        </div>
        <div data-testid="cell-date" className="py-2 px-4 text-element-light-lighter-700 whitespace-nowrap">
          {dateFullFormat(data.created_at)}
        </div>
        <div data-testid="cell-msg" className="py-2 px-4 text-text-100">
          <span className="whitespace-pre-wrap break-all">{data.message}</span>
        </div>
      </div>
      <div data-testid="cell-version" className="flex whitespace-nowrap py-2 px-4 text-text-100 pr-5">
        <CopyToClipboard className="opacity-0 group-hover:opacity-100 mr-4 text-white" content={data.message} />
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
