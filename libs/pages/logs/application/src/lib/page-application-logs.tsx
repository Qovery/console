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
  // const dispatch = useDispatch<AppDispatch>()

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

  const { getAccessTokenSilently } = useAuth()

  const logsUrl: any = useCallback(async () => {
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&service=${applicationId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, applicationId, getAccessTokenSilently])

  const { lastMessage } = useWebSocket(logsUrl)

  useEffect(() => {
    const interval = setInterval(() => {
      lastMessage &&
        setLogs((prev) => ({
          items: (prev.items as Log[]).concat(JSON.parse(lastMessage?.data)),
          loadingStatus: 'loaded',
        }))
    }, 1000)
    return () => clearInterval(interval)
  }, [lastMessage])

  const tableHead = [
    {
      title: 'Pod name',
      className: 'py-2 pl-10 h-full text-text-300 w-[224px]',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Time',
      className: 'px-4 w-[164px]',
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
    <LayoutLogs data={logs} application={application} withNav>
      <Table
        className="bg-transparent"
        classNameHead="!flex bg-element-light-darker-300 !border-transparent"
        dataHead={tableHead}
        defaultData={logs.items}
      >
        <div>
          {(logs.items as Log[])?.map((log: Log, index: number) => (
            <Row key={log.id} index={index} data={log} />
          ))}
        </div>
      </Table>
    </LayoutLogs>
  )
}

export default PageApplicationLogs
