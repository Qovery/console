import { useParams } from 'react-router-dom'
import { useCustomDomains, useDeleteCustomDomain, useService } from '@qovery/domains/services/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDomainsFeature() {
  const { applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: customDomains, isLoading: isLoadingCustomDomains } = useCustomDomains({
    serviceId: applicationId,
    serviceType: service?.serviceType ?? 'APPLICATION',
  })
  const { mutate: deleteCustomDomain } = useDeleteCustomDomain()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  if (service?.serviceType !== 'APPLICATION' && service?.serviceType !== 'CONTAINER') return null

  return (
    <PageSettingsDomains
      domains={customDomains}
      loading={isLoadingCustomDomains}
      onAddDomain={() => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} service={service} />,
        })
      }}
      onEdit={(customDomain) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} service={service} customDomain={customDomain} />,
        })
      }}
      onDelete={(customDomain) => {
        openModalConfirmation({
          title: 'Delete custom domain',
          isDelete: true,
          name: customDomain.domain,
          action: () => {
            if (service) {
              deleteCustomDomain({
                serviceId: service.id,
                customDomainId: customDomain.id,
                serviceType: service.serviceType,
              })
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsDomainsFeature
