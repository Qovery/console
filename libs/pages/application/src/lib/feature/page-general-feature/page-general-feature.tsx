import { ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus, getApplicationsState } from '@qovery/domains/application'
import { fetchOrganizationContainerRegistries } from '@qovery/domains/organization'
import { isContainer, isContainerJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageGeneral from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { applicationId = '', organizationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to manage my application',
      external: true,
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))
  const dispatch = useDispatch<AppDispatch>()
  const organizationLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => state.organization.organizations.loadingStatus
  )
  const [currentRegistry, setCurrentRegistry] = useState<ContainerRegistryResponse | undefined>(undefined)

  const computeStability = (): number => {
    let c = 0

    application?.running_status?.pods.forEach((pod) => {
      c += pod.restart_count
    })

    return c
  }

  useEffect(() => {
    if (
      application &&
      (isContainer(application) || isContainerJob(application)) &&
      organizationLoadingStatus === 'loaded'
    ) {
      dispatch(fetchOrganizationContainerRegistries({ organizationId }))
        .unwrap()
        .then((registries) => {
          setCurrentRegistry(
            registries.find(
              (registry) =>
                registry.id ===
                (isContainerJob(application) ? application.source?.image?.registry_id : application.registry?.id)
            )
          )
        })
    }
  }, [organizationId, dispatch, organizationLoadingStatus, application, setCurrentRegistry])

  return (
    <PageGeneral
      application={application}
      listHelpfulLinks={listHelpfulLinks}
      loadingStatus={loadingStatus}
      serviceStability={computeStability()}
      currentRegistry={currentRegistry}
    />
  )
}

export default PageGeneralFeature
