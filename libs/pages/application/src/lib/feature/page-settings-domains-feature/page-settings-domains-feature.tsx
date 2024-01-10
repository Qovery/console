import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
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

  console.log('customDomains', customDomains)

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, { serviceType: 'HELM' }, (s) => (
      <PageSettingsDomains
        domains={customDomains}
        loading={isLoadingCustomDomains}
        onAddDomain={() => {
          openModal({
            content: <CrudModalFeature onClose={closeModal} service={s} />,
          })
        }}
        onEdit={(customDomain) => {
          openModal({
            content: <CrudModalFeature onClose={closeModal} service={s} customDomain={customDomain} />,
          })
        }}
        onDelete={(customDomain) => {
          openModalConfirmation({
            title: 'Delete custom domain',
            isDelete: true,
            name: customDomain.domain,
            action: () => {
              if (s) {
                deleteCustomDomain({
                  serviceId: s.id,
                  customDomainId: customDomain.id,
                  serviceType: s.serviceType,
                })
              }
            },
          })
        }}
      />
    ))
    .otherwise(() => null)
}

export default PageSettingsDomainsFeature
