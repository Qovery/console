import { memo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus, getApplicationsState } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { useContainerRegistry } from '@qovery/domains/organizations/feature'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { isContainer, isContainerJob, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { type RootState } from '@qovery/state/store'
import PageGeneral from '../../ui/page-general/page-general'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export function PageGeneralFeature() {
  const { applicationId = '', organizationId = '', projectId = '', environmentId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to manage my application',
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const containerRegistryId =
    application && isContainerJob(application) ? application?.source?.image?.registry_id : application?.registry?.id

  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId,
  })
  const { data: runningStatus } = useRunningStatus({
    environmentId: application?.environment?.id,
    serviceId: application?.id,
  })

  const computeStability = (): number => {
    let c = 0

    runningStatus?.pods.forEach((pod) => {
      c += pod.restart_count
    })

    return c
  }

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  return (
    <>
      <PageGeneral
        application={application}
        listHelpfulLinks={listHelpfulLinks}
        loadingStatus={loadingStatus}
        serviceStability={computeStability()}
        currentRegistry={containerRegistry}
      />
      <WebSocketListenerMemo
        organizationId={organizationId}
        clusterId={environment?.cluster_id ?? ''}
        projectId={projectId}
        environmentId={environmentId}
        serviceId={applicationId}
        serviceType={isJob(application) ? 'JOB' : isContainer(application) ? 'CONTAINER' : 'APPLICATION'}
      />
    </>
  )
}

export default PageGeneralFeature
