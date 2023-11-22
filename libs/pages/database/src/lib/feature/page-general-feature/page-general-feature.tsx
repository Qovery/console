import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { type BaseLink } from '@qovery/shared/ui'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import PageGeneral from '../../ui/page-general/page-general'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export function PageGeneralFeature() {
  const { databaseId = '', environmentId = '', projectId = '', organizationId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId: databaseId })
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
      linkLabel: 'How to manage my database',
    },
  ]
  const { data: environment } = useEnvironment({ environmentId })

  return (
    <>
      <PageGeneral
        databaseMode={service?.serviceType === 'DATABASE' ? service.mode : undefined}
        listHelpfulLinks={listHelpfulLinks}
      />
      {environment && (
        <WebSocketListenerMemo
          organizationId={organizationId}
          clusterId={environment.cluster_id}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={databaseId}
          serviceType="DATABASE"
        />
      )}
    </>
  )
}

export default PageGeneralFeature
