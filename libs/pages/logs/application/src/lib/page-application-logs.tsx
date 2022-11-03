import { Environment, Log } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { LayoutLogs, Table } from '@qovery/shared/ui'
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

  const [logs, setLogs] = useState([])

  const { getAccessTokenSilently } = useAuth()

  // In functional React component
  const logsUrl: any = useCallback(async () => {
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&service=${applicationId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, applicationId, getAccessTokenSilently])

  const { lastMessage } = useWebSocket(logsUrl)

  useEffect(() => {
    if (lastMessage !== null) {
      setLogs((prev) =>
        prev.length <= 100
          ? prev.concat(JSON.parse(lastMessage.data))
          : prev.concat(JSON.parse(lastMessage.data)).slice(-100)
      )
    }
  }, [lastMessage, setLogs])

  const columnsWidth = '10% 10% 10% 55% 15%'

  const tableHead = [
    {
      title: 'Pod name',
      className: 'px-4 py-2 h-full ml-7 text-text-300',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Time',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Message',
      className: 'px-4',
      classNameTitle: 'text-text-300',
    },
    {
      title: 'Version',
      className: 'pl-4 pr-5 text-right',
      classNameTitle: 'text-text-300',
    },
  ]

  return (
    <LayoutLogs data={logs}>
      <Table
        className="bg-transparent"
        classNameHead="bg-element-light-darker-300 !border-transparent"
        dataHead={tableHead}
        defaultData={logs}
        columnsWidth={columnsWidth}
      >
        <div>
          {logs?.map((log: Log, index: number) => (
            <Row key={`${log.created_at}-${index}`} index={index} data={log} />
          ))}
        </div>
      </Table>
    </LayoutLogs>
  )
}

export default PageApplicationLogs
