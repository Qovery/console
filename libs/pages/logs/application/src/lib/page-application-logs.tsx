import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { LayoutLogs } from '@qovery/shared/ui'

export function PageApplicationLogs() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  // const dispatch = useDispatch<AppDispatch>()

  // useDocumentTitle(`Cluster ${cluster ? `- ${cluster?.name} (${cluster?.region}) ` : '- Loading...'}`)

  console.group(organizationId, projectId, environmentId, applicationId)

  const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=be9e22b0-d05a-4330-b5b5-547667d380fd&project=${projectId}&environment=${environmentId}&service=${applicationId}`

  const { lastMessage } = useWebSocket(url, {
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => false,
    share: true,
  })

  console.log(lastMessage)

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
