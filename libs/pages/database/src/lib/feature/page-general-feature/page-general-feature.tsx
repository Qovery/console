import { memo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { databasesLoadingStatus, getDatabasesState } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { ServiceType } from '@qovery/domains/services/data-access'
import { type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { useMetricsWebSocket } from '@qovery/shared/util-web-sockets'
import { type RootState } from '@qovery/state/store'
import PageGeneral from '../../ui/page-general/page-general'

function WebSocketListener({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  serviceType,
}: {
  clusterId: string
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  serviceType: Omit<ServiceType, 'LIFECYCLE_JOB' | 'CRON_JOB'>
}) {
  useMetricsWebSocket({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    serviceId,
    serviceType,
  })

  return null
}

// XXX: There is currently continuous re-render due to cluster mutation (related to legacy way to retrieve statuses)
// We use memo to prevent web-socket invalidations
const WebSocketListenerMemo = memo(WebSocketListener)

export function PageGeneralFeature() {
  const { databaseId = '', environmentId = '', projectId = '', organizationId = '' } = useParams()
  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => getDatabasesState(state).entities[databaseId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
      linkLabel: 'How to manage my database',
      external: true,
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => databasesLoadingStatus(state))
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  return (
    <>
      <PageGeneral database={database} listHelpfulLinks={listHelpfulLinks} loadingStatus={loadingStatus} />
      <WebSocketListener
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
