import { Environment, Log } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum, LayoutLogs, StatusChip, Table, TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import Row from './ui/row/row'

export function PageApplicationLogs() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const applications = useSelector<RootState, ApplicationEntity[] | undefined>((state) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  useDocumentTitle(`Application logs ${application ? `- ${application?.name}` : '- Loading...'}`)

  const [logs, setLogs] = useState<Log[]>([])
  const [pauseLogs, setPauseLogs] = useState<Log[]>([])
  const [filter, setFilter] = useState<TableFilterProps>({})
  const [pauseStatusLogs, setPauseStatusLogs] = useState(false)

  const [loading, setLoading] = useState<LoadingStatus>('not loaded')

  const { getAccessTokenSilently } = useAuth()

  const applicationLogsUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&service=${applicationId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, applicationId, getAccessTokenSilently])

  useWebSocket(applicationLogsUrl, {
    onMessage: (message) => {
      setLoading('loaded')

      if (pauseStatusLogs) {
        setPauseLogs((prev: Log[]) => [...prev, JSON.parse(message?.data)])
      } else {
        setLogs((prev: Log[]) => [...prev, ...pauseLogs, JSON.parse(message?.data)])
        setPauseLogs([])
      }
    },
  })

  useEffect(() => {
    // reset state when the applicationId change
    if (applicationId) {
      setLoading('not loaded')
      setLogs([])
      setPauseLogs([])
      setPauseStatusLogs(false)
    }
  }, [applicationId])

  const tableHead = [
    {
      title: 'Pod name',
      className: 'px-4 py-2 h-full text-text-300 w-[198px]',
      classNameTitle: 'text-text-300',
      menuWidth: 360,
      filter: [
        {
          title: 'Filter by pod name',
          key: 'pod_name',
          itemContentCustom: (data: Log, currentFilter: string) => {
            const isActive = data.pod_name === currentFilter
            const currentPod = application?.running_status?.pods.filter((pod) => pod.name === data.pod_name)[0]
            return (
              <div
                className={`group flex justify-between items-center w-[calc(100%+24px)] rounded-sm px-3 -mx-3 h-full ${
                  isActive ? 'bg-element-light-darker-600' : ''
                }`}
              >
                <StatusChip status={currentPod?.state} className="mr-2.5" />
                <p className="text-xs font-medium text-text-200 mr-5">{data.pod_name}</p>
                <span className="block text-xxs text-text-400 mr-2">
                  <Icon name={IconAwesomeEnum.CODE_COMMIT} className="mr-2 text-text-100" />
                  {data.version?.substring(0, 6)}
                </span>
                {
                  <Icon
                    name={IconAwesomeEnum.FILTER}
                    className={`text-ssm group-hover:text-text-100 ${
                      isActive ? 'text-warning-500' : 'text-transparent'
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
      className: 'pl-4 pr-10 text-right',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Time',
      className: 'pl-5 pr-4 w-[156px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
  ]

  const memoRow = useMemo(
    () => logs?.map((log: Log, index: number) => <Row key={index} data={log} filter={filter} />),
    [filter, logs]
  )

  return (
    <LayoutLogs
      key={applicationId}
      data={{
        items: logs,
        loadingStatus: loading,
      }}
      applications={applications}
      environment={environment}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      withLogsNavigation
      lineNumbers={false}
    >
      <Table
        className="bg-transparent"
        classNameHead="!flex bg-element-light-darker-300 !border-transparent"
        dataHead={tableHead}
        data={logs}
        setFilter={setFilter}
      >
        <div className="pb-10">{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PageApplicationLogs
