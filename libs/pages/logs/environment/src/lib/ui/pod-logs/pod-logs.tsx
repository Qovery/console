import { Log } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { LayoutLogs } from '@qovery/shared/console-shared'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum, StatusChip, Table, TableFilterProps, TableHeadProps } from '@qovery/shared/ui'
import RowPod from '../row-pod/row-pod'

export interface PodLogsProps {
  loadingStatus: LoadingStatus
  logs: Log[]
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  service?: ApplicationEntity | DatabaseEntity
  enabledNginx?: boolean
  setEnabledNginx?: (debugMode: boolean) => void
  countNginx?: number
}

export function PodLogs(props: PodLogsProps) {
  const {
    logs,
    service,
    pauseStatusLogs,
    setPauseStatusLogs,
    loadingStatus,
    enabledNginx,
    setEnabledNginx,
    countNginx,
  } = props

  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const publiclyExposedPort = Boolean((service as ApplicationEntity).ports?.find((port) => port.publicly_accessible))

  const tableHead: TableHeadProps<Log>[] = [
    {
      title: 'Pod name',
      className: 'ml-14 pr-4 py-2 h-full text-neutral-300 w-[208px]',
      classNameTitle: 'text-neutral-300',
      menuWidth: 360,
      filter: [
        {
          title: 'Filter by pod name',
          key: 'pod_name',
          itemContentCustom: (data: Log, currentFilter: string) => {
            const isActive = data.pod_name === currentFilter
            const currentPod = service?.running_status?.pods.filter((pod) => pod.name === data.pod_name)[0]
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
                {
                  <Icon
                    name={IconAwesomeEnum.FILTER}
                    className={`text-ssm group-hover:text-neutral-50 ml-auto ${
                      isActive ? 'text-yellow-500' : 'text-transparent'
                    }`}
                  />
                }
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

  const memoRow = useMemo(
    () =>
      logs?.map((log: Log, index: number) => {
        return <RowPod key={log.id} index={index} data={log} filter={filter} />
      }),
    [logs, filter]
  )

  return (
    <LayoutLogs
      data={{
        items: logs,
        loadingStatus: loadingStatus,
      }}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      serviceRunningStatus={service?.running_status}
      enabledNginx={enabledNginx}
      setEnabledNginx={publiclyExposedPort ? setEnabledNginx : undefined}
      countNginx={countNginx}
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
        <div className="pt-1 pb-8">{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PodLogs
