import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCustomDomains, useDeleteCustomDomain } from '@qovery/domains/custom-domains/feature'
import { useCheckCustomDomains, useService } from '@qovery/domains/services/feature'
import { Callout, useModal, useModalConfirmation } from '@qovery/shared/ui'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageSettingsDomainsFeature() {
  const { organizationId = '', projectId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: customDomains, isLoading: isLoadingCustomDomains } = useCustomDomains({
    serviceId: applicationId,
    serviceType: service?.serviceType ?? 'APPLICATION',
  })

  const {
    data: checkedCustomDomains,
    refetch: refetchCheckCustomDomains,
    isFetching: isFetchingCheckedCustomDomains,
  } = useCheckCustomDomains({
    serviceId: applicationId,
    serviceType: service?.serviceType ?? 'APPLICATION',
  })
  const { mutate: deleteCustomDomain } = useDeleteCustomDomain()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, { serviceType: 'HELM' }, (s) => (
      <PageSettingsDomains
        domains={customDomains}
        loading={isLoadingCustomDomains}
        onCheckCustomDomains={refetchCheckCustomDomains}
        checkedCustomDomains={checkedCustomDomains}
        isFetchingCheckedCustomDomains={isFetchingCheckedCustomDomains}
        onAddDomain={() => {
          openModal({
            content: (
              <CrudModalFeature
                organizationId={organizationId}
                projectId={projectId}
                onClose={closeModal}
                service={s}
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
                service={s}
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
            warning: (
              <>
                <Callout.TextHeading>Domain migration - read this!</Callout.TextHeading>
                <Callout.TextDescription>
                  If you are in a migration process and want to assign this domain to another application, make sure you
                  deploy first this application to ensure that every configuration is cleaned up.
                </Callout.TextDescription>
              </>
            ),
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
