import { Log } from 'qovery-typescript-axios'
import { CopyToClipboard, Icon, IconAwesomeEnum, TableFilterProps, TableRowFilter, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

const COLORS = [
  '#7EFFF5',
  '#FFC312',
  '#06ADF6',
  '#17C0EB',
  '#12CBC4',
  '#D980FA',
  '#FDA7DF',
  '#B53471',
  '#9980FA',
  '#C4E538',
  '#FFB8B8',
]

export const getColorByPod = (pod?: string) => {
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

export const formatVersion = (version: string) => {
  if (version.length < 6) {
    return version
  } else {
    return (
      <Tooltip content={version}>
        <span>
          {version.substring(0, 3)}...{version.slice(-3)}
        </span>
      </Tooltip>
    )
  }
}

export interface RowProps {
  data: Log
  filter: TableFilterProps
}

export function Row(props: RowProps) {
  const { data, filter } = props

  return (
    <TableRowFilter data={data} filter={filter}>
      <div className="application-log group flex justify-between min-h-6 font-code text-xs hover:bg-element-light-darker-400 w-full overflow-y-auto">
        <div
          data-testid="cell-pod-name"
          className="py-1 px-4 text-element-light-lighter-700 whitespace-nowrap relative after:absolute after:-right-[1px] after:top-1 after:bg-element-light-darker-100 after:w-[1px] after:h-4"
          style={{ color: getColorByPod(data.pod_name) }}
        >
          <Tooltip content={data.pod_name || ''}>
            <span>
              {data.pod_name?.substring(0, 10)}...{data.pod_name?.slice(-10)}
            </span>
          </Tooltip>
        </div>
        <div data-testid="cell-version" className="flex whitespace-nowrap py-1 pl-4 text-text-100 min-w-[100px]">
          {data.version && (
            <span>
              <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-1" />
              {formatVersion(data.version)}
            </span>
          )}
        </div>
        <div data-testid="cell-date" className="py-1 px-4 text-element-light-lighter-700 whitespace-nowrap">
          {dateFullFormat(data.created_at)}
        </div>
        <div data-testid="cell-msg" className="py-1 pr-6 text-text-100 relative w-full">
          <span className="whitespace-pre-wrap break-all">{data.message}</span>
          <CopyToClipboard
            className="opacity-0 group-hover:opacity-100 text-white !absolute right-2 top-1"
            content={data.message}
          />
        </div>
      </div>
    </TableRowFilter>
  )
}

export default Row
