import { Environment, EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { LayoutLogs, Table } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import Row from './ui/row/row'

export function PageDeploymentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const applications = useSelector<RootState, ApplicationEntity[] | undefined>((state) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  useDocumentTitle(`Deployment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [pauseLogs, setPauseLogs] = useState<EnvironmentLogs[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState(false)

  const [loading, setLoading] = useState<LoadingStatus>('not loaded')

  const { getAccessTokenSilently } = useAuth()

  const deploymentLogsUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, getAccessTokenSilently])

  useWebSocket(deploymentLogsUrl, {
    onMessage: (message) => {
      setLoading('loaded')

      if (pauseStatusLogs) {
        setPauseLogs((prev: EnvironmentLogs[]) => [...prev, ...JSON.parse(message?.data)])
      } else {
        setLogs((prev: EnvironmentLogs[]) => [...prev, ...pauseLogs, ...JSON.parse(message?.data)])
        setPauseLogs([])
      }
    },
  })

  const tableHead = [
    {
      title: '',
    },
    {
      title: 'Status',
      className: 'pl-2.5 pr-2 w-[154px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Time',
      className: 'pl-2 pr-4',
      classNameTitle: 'text-text-300 w-[154px]',
    },
    {
      title: 'Scope',
      className: 'px-2 py-2 h-full text-text-300 w-[154px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
  ]

  const columnsWidth = '40px 154px 154px 154px auto'

  const memoRow = useMemo(
    () => logs?.map((log: EnvironmentLogs, index: number) => <Row key={index} index={index} data={log} />),
    [logs]
  )

  const errors = logs
    .map((log: EnvironmentLogs, index: number) => ({
      index: index,
      errors: log.error,
    }))
    .filter((log) => log.errors)

  return (
    <LayoutLogs
      data={{
        items: logs,
        loadingStatus: loading,
      }}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      environment={environment}
      applications={applications}
      withLogsNavigation
      lineNumbers
      errors={errors}
    >
      <Table
        className="bg-transparent pb-10"
        classNameHead="bg-element-light-darker-300 !border-transparent"
        columnsWidth={columnsWidth}
        dataHead={tableHead}
        data={logs}
      >
        <div>{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PageDeploymentLogs
