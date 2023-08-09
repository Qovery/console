import { Log } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/shared/console-shared'
import {
  CopyToClipboard,
  Icon,
  IconAwesomeEnum,
  TableFilterProps,
  TableRowFilter,
  Tooltip,
  convertToAnsi,
} from '@qovery/shared/ui'
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
        <span>{version.substring(0, 7)}</span>
      </Tooltip>
    )
  }
}

export interface RowPodProps {
  data: Log
  index: number
  filter?: TableFilterProps[]
}

export function RowPod(props: RowPodProps) {
  const { data, filter, index } = props
  const { utc } = useContext(UpdateTimeContext)

  return (
    <TableRowFilter data={data} filter={filter}>
      <div
        data-testid="pod-log-row"
        className="group flex justify-between font-code text-xs hover:bg-element-light-darker-400 w-full mb-[2px] select-none"
      >
        <div
          data-testid="index"
          className="bg-element-light-darker-500 text-text-500 group-hover:bg-element-light-darker-200"
        >
          <div className="text-right w-10 h-5 px-2 pt-0.5 font-code">{index + 1}</div>
        </div>
        <div
          data-testid="cell-pod-name"
          className="px-4 text-element-light-lighter-700 whitespace-nowrap min-w-[225px]"
          style={{ color: getColorByPod(data.pod_name) }}
        >
          {data.pod_name && data.pod_name && (
            <span className="h-5 flex justify-center items-center px-2 bg-element-light-darker-100 rounded-[40px] gap-1">
              {data.pod_name && data.pod_name.length > 23
                ? `${data.pod_name?.substring(0, 10)}...${data.pod_name?.slice(-10)}`
                : data.pod_name}
              <CopyToClipboard className="opacity-50" content={data.pod_name} />
            </span>
          )}
          {!data.pod_name && !data.message.includes('No pods found' || '') && <span className="block">NGINX</span>}
          {!data.pod_name && data.message.includes('No pods found' || '') && <span className="block">undefined</span>}
        </div>
        <div data-testid="cell-version" className="pt-0.5 flex whitespace-nowrap text-text-100 min-w-[85px]">
          {data.version && (
            <span className="group/version">
              <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-1" />
              {formatVersion(data.version)}
              <CopyToClipboard className="opacity-0 ml-1 group-hover/version:opacity-80" content={data.version} />
            </span>
          )}
        </div>
        <div data-testid="cell-date" className="px-4 pt-0.5 text-element-light-lighter-700 whitespace-nowrap">
          {dateFullFormat(data.created_at, utc ? 'UTC' : undefined, 'dd MMM, HH:mm:ss:SS')}
        </div>
        <div data-testid="cell-msg" className="select-text pr-6 pt-0.5 text-text-100 relative w-full">
          <span className="whitespace-pre-wrap break-all">{convertToAnsi(data.message)}</span>
        </div>
      </div>
    </TableRowFilter>
  )
}

export default RowPod
