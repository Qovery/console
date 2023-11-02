import { useQueryClient } from '@tanstack/react-query'
import { type CustomDomain } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteCustomDomain,
  fetchCustomDomains,
  getApplicationsState,
  getCustomDomainsState,
  selectCustomDomainsByApplicationId,
} from '@qovery/domains/application'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { queries } from '@qovery/state/util-queries'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDomainsFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { organizationId = '', projectId = '', applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  const customDomains = useSelector<RootState, CustomDomain[] | undefined>((state) =>
    selectCustomDomainsByApplicationId(state, applicationId)
  )

  const customDomainsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getCustomDomainsState(state).loadingStatus
  )

  const queryClient = useQueryClient()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (application) {
      dispatch(fetchCustomDomains({ applicationId, serviceType: getServiceType(application) }))
    }
  }, [dispatch, applicationId, application])

  return (
    <PageSettingsDomains
      domains={customDomains}
      loading={customDomainsLoadingStatus}
      onAddDomain={() => {
        openModal({
          content: (
            <CrudModalFeature
              organizationId={organizationId}
              projectId={projectId}
              onClose={closeModal}
              application={application}
            />
          ),
        })
      }}
      onEdit={(customDomain) => {
        openModal({
          content: (
            <CrudModalFeature
              organizationId={organizationId}
              projectId={projectId}
              onClose={closeModal}
              application={application}
              customDomain={customDomain}
            />
          ),
        })
      }}
      onDelete={(customDomain) => {
        openModalConfirmation({
          title: 'Delete custom domain',
          isDelete: true,
          name: customDomain.domain,
          action: () => {
            if (application) {
              dispatch(deleteCustomDomain({ applicationId, customDomain, serviceType: getServiceType(application) }))
                .unwrap()
                .then(() => {
                  queryClient.invalidateQueries(
                    queries.services.listLinks({
                      serviceId: applicationId,
                      serviceType: getServiceType(application as ApplicationEntity) as Extract<
                        ServiceType,
                        'APPLICATION' | 'CONTAINER' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'
                      >,
                    })
                  )
                })
                .catch((e) => {
                  console.error(e)
                })
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsDomainsFeature
