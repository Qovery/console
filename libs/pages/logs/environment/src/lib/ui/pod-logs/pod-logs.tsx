import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { LayoutLogs } from '@qovery/shared/console-shared'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import {
  Icon,
  IconAwesomeEnum,
  StatusChip,
  Table,
  type TableFilterProps,
  type TableHeadProps,
  Tooltip,
} from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'
import RowPod from '../row-pod/row-pod'

export interface PodLogsProps {
  loadingStatus: LoadingStatus
  logs: Array<ServiceLogResponseDto & { id: number }>
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  service?: AnyService
  enabledNginx?: boolean
  setEnabledNginx?: (debugMode: boolean) => void
  showPreviousLogs?: boolean
  setShowPreviousLogs?: (showPreviousLogs: boolean) => void
  countNginx?: number
  isProgressing?: boolean
  filter: TableFilterProps[]
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
}

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

function getColorByPod(pod: string) {
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

export function PodLogs({
  logs,
  service,
  pauseStatusLogs,
  setPauseStatusLogs,
  loadingStatus,
  enabledNginx,
  setEnabledNginx,
  showPreviousLogs,
  setShowPreviousLogs,
  countNginx,
  isProgressing,
  filter,
  setFilter,
}: PodLogsProps) {
  const publiclyExposedPort =
    ((service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
      Boolean(service.ports?.find((port) => port.publicly_accessible))) ||
    (service?.serviceType === 'HELM' && Boolean((service.ports ?? []).length > 0))

  const { data: serviceRunningStatus } = useRunningStatus({
    environmentId: service?.environment?.id,
    serviceId: service?.id,
  })

  const tableHead: TableHeadProps<ServiceLogResponseDto>[] = [
    {
      title: 'Pod name',
      className: 'ml-14 pr-4 py-2 h-full text-neutral-300 w-[208px]',
      classNameTitle: 'text-neutral-300',
      menuWidth: 360,
      filter: [
        {
          title: 'Filter by pod name',
          key: 'pod_name',
          itemContentCustom: (data: ServiceLogResponseDto, currentFilter: string) => {
            const isActive = data.pod_name === currentFilter
            const currentPod = serviceRunningStatus?.pods.filter((pod) => pod.name === data.pod_name)[0]
            return (
              <div
                className={`group -mx-3 flex h-full w-[calc(100%+24px)] items-center rounded-sm px-3 ${
                  isActive ? 'bg-neutral-800' : ''
                }`}
              >
                <div className="mr-2.5 w-4">
                  <StatusChip status={currentPod?.state} />
                </div>
                <Tooltip content={data.pod_name}>
                  <p className="mr-5 truncate text-xs font-medium text-neutral-100" title={data.pod_name}>
                    {data.pod_name && data.pod_name.length > 23
                      ? trimId(data.pod_name, 'both', { startOffset: 10, endOffset: 10 })
                      : data.pod_name}
                  </p>
                </Tooltip>
                <span className="mr-2 block text-2xs text-neutral-350">
                  {data.version && (
                    <>
                      <Icon iconName="code-commit" className="mr-2 text-neutral-50" />
                      {data.version?.substring(0, 6)}
                    </>
                  )}
                </span>
                <Icon
                  name={IconAwesomeEnum.FILTER}
                  className={`ml-auto text-ssm group-hover:text-neutral-50 ${
                    isActive ? 'text-yellow-500' : 'text-transparent'
                  }`}
                />
              </div>
            )
          },
        },
      ],
    },
    {
      title: 'Version',
      className: 'pr-10 text-right',
      classNameTitle: 'text-neutral-300',
    },
    {
      title: 'Time',
      className: 'pl-5 pr-4 w-[156px]',
      classNameTitle: 'text-neutral-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-neutral-300',
    },
  ]

  const podNameToColor = useMemo(() => {
    const res = new Map<string, string>()
    for (const { pod_name } of logs) {
      if (!res.has(pod_name)) {
        res.set(pod_name, getColorByPod(pod_name))
      }
    }
    return res
  }, [logs])

  const memoRow = useMemo(
    () =>
      logs?.map((log, index) => {
        return <RowPod key={log.id} index={index} data={log} filter={filter} podNameToColor={podNameToColor} />
      }),
    [logs, filter, podNameToColor]
  )

  if (!service) return null

  return (
    <LayoutLogs
      type="live"
      data={{
        items: logs,
        loadingStatus: loadingStatus,
      }}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      enabledNginx={enabledNginx}
      setEnabledNginx={publiclyExposedPort ? setEnabledNginx : undefined}
      countNginx={countNginx}
      service={service}
      isProgressing={isProgressing}
      progressingMsg="Streaming application logs"
      withLogsNavigation
      lineNumbers
    >
      <Table
        className="bg-transparent"
        classNameHead="!flex !bg-neutral-650 !border-transparent"
        dataHead={tableHead}
        data={logs}
        setFilter={setFilter}
        filter={filter}
      >
        {showPreviousLogs === false && (
          <button
            type="button"
            className="block w-full bg-neutral-500 py-1.5 text-center text-sm font-medium text-neutral-250 transition hover:bg-neutral-600"
            onClick={() => setShowPreviousLogs?.(true)}
          >
            Load previous logs
            <Icon iconName="arrow-up" className="ml-1.5" />
          </button>
        )}
        <div className="pb-8 pt-1">{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PodLogs
