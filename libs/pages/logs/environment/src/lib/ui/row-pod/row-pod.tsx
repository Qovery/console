import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/shared/console-shared'
import { Ansi } from '@qovery/shared/ui'
import {
  CopyToClipboard,
  Icon,
  IconAwesomeEnum,
  type TableFilterProps,
  TableRowFilter,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'

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

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export interface RowPodProps {
  data: ServiceLogResponseDto
  index: number
  filter?: TableFilterProps[]
  podNameToColor: Map<string, string>
}

export function RowPod({ data, filter, index, podNameToColor }: RowPodProps) {
  const { utc } = useContext(UpdateTimeContext)

  return (
    <TableRowFilter data={data} filter={filter}>
      <div
        data-testid="pod-log-row"
        className="group flex justify-between font-code text-xs hover:bg-neutral-650 w-full mb-[2px] select-none"
      >
        <div
          data-testid="index"
          className="bg-neutral-700 text-neutral-400 group-hover:bg-neutral-550 px-2 pt-0.5 font-code min-w-[40px] max-w-[40px] text-right box-border"
        >
          {index + 1}
        </div>
        <div
          data-testid="cell-pod-name"
          className="px-4 text-neutral-350 whitespace-nowrap min-w-[225px]"
          style={{ color: podNameToColor.get(data.pod_name) }}
        >
          {data.pod_name && data.pod_name && (
            <span className="h-5 flex justify-center items-center px-2 bg-neutral-500 rounded-[40px] gap-1">
              {data.pod_name && data.pod_name.length > 23
                ? `${data.pod_name?.substring(0, 10)}...${data.pod_name?.slice(-10)}`
                : data.pod_name}
              <CopyToClipboard className="opacity-50" content={data.pod_name} />
            </span>
          )}
          {!data.pod_name && !data.message.includes('No pods found' || '') && <span className="block">NGINX</span>}
          {!data.pod_name && data.message.includes('No pods found' || '') && <span className="block">undefined</span>}
        </div>
        <div data-testid="cell-version" className="pt-0.5 flex whitespace-nowrap text-neutral-50 min-w-[85px]">
          {data.version && (
            <span className="group/version">
              <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-1" />
              {formatVersion(data.version)}
              <CopyToClipboard className="opacity-0 ml-1 group-hover/version:opacity-80" content={data.version} />
            </span>
          )}
        </div>
        <div data-testid="cell-date" className="px-4 pt-0.5 text-neutral-350 whitespace-nowrap">
          {dateFullFormat(data.created_at, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss:SS')}
        </div>
        <Ansi
          data-testid="cell-msg"
          className="select-text pr-6 pt-0.5 text-neutral-50 relative w-full whitespace-pre-wrap break-all code-ansi"
        >
          {data.message}
        </Ansi>
      </div>
    </TableRowFilter>
  )
}

export default RowPod
