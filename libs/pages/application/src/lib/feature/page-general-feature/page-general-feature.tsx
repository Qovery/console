import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus, getApplicationsState } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { isContainer, isContainerJob, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus, type OrganizationEntity } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { type AppDispatch, type RootState } from '@qovery/state/store'
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
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const dispatch = useDispatch<AppDispatch>()
  const organizationLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => state.organization.organizations.loadingStatus
  )
  const [currentRegistry, setCurrentRegistry] = useState<ContainerRegistryResponse | undefined>(undefined)
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

  useEffect(() => {
    if (
      application &&
      (isContainer(application) || isContainerJob(application)) &&
      organizationLoadingStatus === 'loaded' &&
      (organization?.containerRegistries?.loadingStatus === 'not loaded' ||
        organization?.containerRegistries?.loadingStatus === undefined)
    ) {
      dispatch(fetchOrganizationContainerRegistries({ organizationId }))
    }
  }, [
    organizationId,
    dispatch,
    organizationLoadingStatus,
    application,
    setCurrentRegistry,
    organization?.containerRegistries,
  ])

  useEffect(() => {
    if (organization?.containerRegistries?.items && application) {
      const reg = organization?.containerRegistries?.items.find(
        (registry) =>
          registry.id ===
          (isContainerJob(application) ? application.source.image.registry_id : application.registry?.id)
      )
      setCurrentRegistry(reg)
    }
  }, [organization?.containerRegistries?.items, application])

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  return (
    <>
      <PageGeneral
        application={application}
        listHelpfulLinks={listHelpfulLinks}
        loadingStatus={loadingStatus}
        serviceStability={computeStability()}
        currentRegistry={currentRegistry}
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
