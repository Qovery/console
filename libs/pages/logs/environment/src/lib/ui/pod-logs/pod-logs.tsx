import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useMemo, useState } from 'react'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { LayoutLogs } from '@qovery/shared/console-shared'
import { type ApplicationEntity, type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum, StatusChip, Table, type TableFilterProps, type TableHeadProps } from '@qovery/shared/ui'
import RowPod from '../row-pod/row-pod'

export interface PodLogsProps {
  loadingStatus: LoadingStatus
  logs: Array<ServiceLogResponseDto & { id: number }>
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  service?: ApplicationEntity | DatabaseEntity
  enabledNginx?: boolean
  setEnabledNginx?: (debugMode: boolean) => void
  showPreviousLogs?: boolean
  setShowPreviousLogs?: (showPreviousLogs: boolean) => void
  countNginx?: number
  isProgressing?: boolean
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
}: PodLogsProps) {
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const publiclyExposedPort = Boolean((service as ApplicationEntity)?.ports?.find((port) => port.publicly_accessible))
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
                className={`group flex items-center w-[calc(100%+24px)] rounded-sm px-3 -mx-3 h-full ${
                  isActive ? 'bg-neutral-800' : ''
                }`}
              >
                <div className="w-4 mr-2.5">
                  <StatusChip status={currentPod?.state} />
                </div>
                <p className="text-xs font-medium text-neutral-100 mr-5 truncate">{data.pod_name}</p>
                <span className="block text-2xs text-neutral-350 mr-2">
                  {data.version && (
                    <>
                      <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-2 text-neutral-50" />
                      {data.version?.substring(0, 6)}
                    </>
                  )}
                </span>
                <Icon
                  name={IconAwesomeEnum.FILTER}
                  className={`text-ssm group-hover:text-neutral-50 ml-auto ${
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
            className="block py-1.5 bg-neutral-500 text-neutral-250 text-center text-sm font-medium"
            onClick={() => setShowPreviousLogs?.(true)}
            style={{ inlineSize: '100%' }}
          >
            Load previous logs
            <Icon name={IconAwesomeEnum.ARROW_UP} className="ml-1.5" />
          </button>
        )}
        <div className="pt-1 pb-8">{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PodLogs
