import { Environment } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { LayoutLogs } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

const useSocket = async (url: string) => {
  const [messageHistory, setMessageHistory] = useState([])
  const { getAccessTokenSilently } = useAuth()
  const token = await getAccessTokenSilently()

  const { lastMessage } = useWebSocket(url + `&bearer_token=${token}`, {
    shouldReconnect: () => false,
    share: true,
  })

  useEffect(() => {
    lastMessage && setMessageHistory((prev) => prev.concat(lastMessage.data))
  }, [lastMessage])

  return { messageHistory }
}

export function PageApplicationLogs() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  // const dispatch = useDispatch<AppDispatch>()

  // useDocumentTitle(`Cluster ${cluster ? `- ${cluster?.name} (${cluster?.region}) ` : '- Loading...'}`)

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&service=${applicationId}`

  const messageHistory = useSocket(url)
  console.log(messageHistory)

  return (
    <LayoutLogs
      data={{
        loadingStatus: 'loaded',
        items: [],
      }}
      tabInformation={<div>hello world</div>}
    >
      <div>hello</div>
      {/* {cluster?.logs?.items &&
        cluster?.logs?.items.map((currentData: ClusterLogs, index: number) => (
          <Row key={index} index={index} data={currentData} firstDate={firstDate} />
        ))} */}
    </LayoutLogs>
  )
}

export default PageApplicationLogs
