import { Environment, Log } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { LayoutLogs, LayoutLogsDataProps, Table } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import Row from './ui/row/row'

export function PageApplicationLogs() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  useDocumentTitle(`Application logs ${application ? `- ${application?.name}` : '- Loading...'}`)

  const [logs, setLogs] = useState({
    items: [],
    loadingStatus: 'not loaded',
  } as LayoutLogsDataProps)

  const [pauseLogs, setPauseLogs] = useState(false)

  const { getAccessTokenSilently } = useAuth()

  const applicationLogsUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&service=${applicationId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, applicationId, getAccessTokenSilently])

  const { lastMessage } = useWebSocket(applicationLogsUrl)

  console.log(lastMessage?.data)

  useEffect(() => {
    const interval = setInterval(() => {
      lastMessage &&
        !pauseLogs &&
        setLogs((prev) => ({
          items: (prev.items as Log[]).concat(JSON.parse(lastMessage?.data)),
          loadingStatus: 'loaded',
        }))
    }, 1000)

    return () => clearInterval(interval)
  }, [lastMessage, pauseLogs])

  const tableHead = [
    {
      title: 'Pod name',
      className: 'px-4 py-2 h-full text-text-300 w-[195px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Time',
      className: 'px-4 w-[150px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Version',
      className: 'pl-4 pr-5 text-right ml-auto',
      classNameTitle: 'text-text-300',
    },
  ]

  return (
    <LayoutLogs
      data={logs}
      application={application}
      pauseLogs={pauseLogs}
      setPauseLogs={setPauseLogs}
      withLogsNavigation
      lineNumbers={false}
    >
      <Table
        className="bg-transparent"
        classNameHead="!flex bg-element-light-darker-300 !border-transparent"
        dataHead={tableHead}
        defaultData={logs.items}
      >
        <div className="pb-10">
          {(logs.items as Log[])?.map((log: Log, index: number) => (
            <Row key={index} data={log} />
          ))}
        </div>
      </Table>
    </LayoutLogs>
  )
}

export default PageApplicationLogs
