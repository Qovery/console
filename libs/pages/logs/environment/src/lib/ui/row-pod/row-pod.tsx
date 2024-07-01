import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useContext } from 'react'
import { UpdateTimeContext } from '@qovery/shared/console-shared'
import { Ansi } from '@qovery/shared/ui'
import { CopyToClipboardButtonIcon, Icon, type TableFilterProps, TableRowFilter, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'

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
        className="group mb-[2px] flex w-full select-none justify-between font-code text-xs hover:bg-neutral-650"
      >
        <div
          data-testid="index"
          className="box-border min-w-[40px] max-w-[40px] bg-neutral-700 px-2 pt-0.5 text-right font-code text-neutral-400 group-hover:bg-neutral-550"
        >
          {index + 1}
        </div>
        <div
          data-testid="cell-pod-name"
          className="min-w-[225px] whitespace-nowrap px-4 text-neutral-350"
          style={{ color: podNameToColor.get(data.pod_name) }}
        >
          {data.pod_name && data.pod_name && (
            <span
              className="flex h-5 items-center justify-center gap-1 rounded-[40px] bg-neutral-500 px-2"
              title={data.pod_name}
            >
              {data.pod_name && data.pod_name.length > 23
                ? `${data.pod_name?.substring(0, 10)}...${data.pod_name?.slice(-10)}`
                : data.pod_name}
              <CopyToClipboardButtonIcon className="opacity-50" content={data.pod_name} />
            </span>
          )}
          {!data.pod_name && !data.message.includes('No pods found' || '') && <span className="block">NGINX</span>}
          {!data.pod_name && data.message.includes('No pods found' || '') && <span className="block">undefined</span>}
        </div>
        <div data-testid="cell-version" className="flex min-w-[85px] whitespace-nowrap pt-0.5 text-neutral-50">
          {data.version && (
            <span className="group/version">
              <Icon iconName="code-commit" className="mr-1" />
              {formatVersion(data.version)}
              <CopyToClipboardButtonIcon
                className="ml-1 opacity-0 group-hover/version:opacity-80"
                content={data.version}
              />
            </span>
          )}
        </div>
        <div
          data-testid="cell-date"
          className="whitespace-nowrap px-4 pt-0.5 text-neutral-350"
          title={dateUTCString(data.created_at)}
        >
          {dateFullFormat(data.created_at, utc ? 'UTC' : timeZone, 'dd MMM, HH:mm:ss.SS')}
        </div>
        <Ansi
          data-testid="cell-msg"
          className="relative w-full select-text whitespace-pre-wrap break-all pr-6 pt-0.5 text-neutral-50"
        >
          {data.message}
        </Ansi>
      </div>
    </TableRowFilter>
  )
}

export default RowPod
