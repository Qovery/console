import { memo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { databasesLoadingStatus, getDatabasesState } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { type RootState } from '@qovery/state/store'
import PageGeneral from '../../ui/page-general/page-general'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export function PageGeneralFeature() {
  const { databaseId = '', environmentId = '', projectId = '', organizationId = '' } = useParams()
  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => getDatabasesState(state).entities[databaseId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
      linkLabel: 'How to manage my database',
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => databasesLoadingStatus(state))
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  return (
    <>
      <PageGeneral database={database} listHelpfulLinks={listHelpfulLinks} loadingStatus={loadingStatus} />
      <WebSocketListenerMemo
        organizationId={organizationId}
        clusterId={environment?.cluster_id ?? ''}
        projectId={projectId}
        environmentId={environmentId}
        serviceId={databaseId}
        serviceType="DATABASE"
      />
    </>
  )
}

export default PageGeneralFeature
