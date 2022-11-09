import { Environment, EnvironmentLog } from 'qovery-typescript-axios'
import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { LayoutLogs, Table } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import Row from './ui/row/row'

export function PageDeploymentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  useDocumentTitle(`Deployment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const [logs, setLogs] = useState<EnvironmentLog[]>([])
  const [pauseLogs, setPauseLogs] = useState<EnvironmentLog[]>([])
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
        setPauseLogs((prev: EnvironmentLog[]) => [...prev, ...JSON.parse(message?.data)])
      } else {
        setLogs((prev: EnvironmentLog[]) => [...prev, ...pauseLogs, ...JSON.parse(message?.data)])
        setPauseLogs([])
      }
    },
  })

  const tableHead = [
    {
      title: 'Time',
      className: 'pl-12 pr-4 w-[185px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Scope',
      className: 'px-4 py-2 h-full text-text-300 w-[160px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Status',
      className: 'px-4 w-[190px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
  ]

  const memoRow = useMemo(
    () => logs?.map((log: EnvironmentLog, index: number) => <Row key={index} index={index} data={log} />),
    [logs]
  )

  return (
    <LayoutLogs
      data={{
        items: logs,
        loadingStatus: loading,
      }}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      environment={environment}
      withLogsNavigation
    >
      <Table
        className="bg-transparent"
        classNameHead="!flex bg-element-light-darker-300 !border-transparent"
        dataHead={tableHead}
        defaultData={logs}
      >
        <div>{memoRow}</div>
      </Table>
    </LayoutLogs>
  )
}

export default PageDeploymentLogs
