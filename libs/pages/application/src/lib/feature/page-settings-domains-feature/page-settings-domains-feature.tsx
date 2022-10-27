import { CustomDomain } from 'qovery-typescript-axios'
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
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDomainsFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    (a, b) => a?.id === b?.id
  )

  const customDomains = useSelector<RootState, CustomDomain[] | undefined>((state) =>
    selectCustomDomainsByApplicationId(state, applicationId)
  )

  const customDomainsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getCustomDomainsState(state).loadingStatus
  )

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
        openModal({ content: <CrudModalFeature onClose={closeModal} application={application} /> })
      }}
      onEdit={(customDomain) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} application={application} customDomain={customDomain} />,
        })
      }}
      onDelete={(customDomain) => {
        openModalConfirmation({
          title: 'Delete custom domain',
          isDelete: true,
          description: 'Are you sure you want to delete this custom domain?',
          name: customDomain.domain,
          action: () => {
            if (application) {
              dispatch(deleteCustomDomain({ applicationId, customDomain, serviceType: getServiceType(application) }))
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsDomainsFeature
