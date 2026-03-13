import { useParams } from '@tanstack/react-router'
import { type CustomDomain } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { useCustomDomains, useDeleteCustomDomain } from '@qovery/domains/custom-domains/feature'
import { type AnyService, type Application, type Container, type Helm } from '@qovery/domains/services/data-access'
import { useCheckCustomDomains, useLinks, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  Callout,
  EmptyState,
  ExternalLink,
  Icon,
  InputText,
  Link,
  LoaderSpinner,
  Section,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { ServiceDomainCrudModal } from '../service-domain-crud-modal/service-domain-crud-modal'

const DomainSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

const isSupportedService = (service?: AnyService): service is Application | Container | Helm =>
  service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER' || service?.serviceType === 'HELM'

export function ServiceDomainSettings() {
  return (
    <Suspense fallback={<DomainSettingsFallback />}>
      <ServiceDomainSettingsContent />
    </Suspense>
  )
}

function ServiceDomainSettingsContent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: customDomains, isLoading: isLoadingCustomDomains } = useCustomDomains({
    serviceId,
    serviceType: service?.serviceType ?? 'APPLICATION',
    suspense: true,
  })
  const {
    data: checkedCustomDomains,
    refetch: refetchCheckCustomDomains,
    isFetching: isFetchingCheckedCustomDomains,
  } = useCheckCustomDomains({
    serviceId,
    serviceType: service?.serviceType ?? 'APPLICATION',
    suspense: true,
  })
  const { data: links = [], isLoading: areLinksLoading } = useLinks({
    serviceId,
    serviceType: service?.serviceType,
    suspense: true,
  })
  const { mutate: deleteCustomDomain } = useDeleteCustomDomain()

  if (!isSupportedService(service)) {
    return null
  }

  const canAddDomain = !isLoadingCustomDomains && !areLinksLoading && links.length > 0
  const noPublicLinkCta =
    service.serviceType === 'HELM'
      ? {
          label: 'Create public networking',
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/networking' as const,
        }
      : {
          label: 'Create public port',
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/port' as const,
        }

  const openCrudModal = (customDomain?: CustomDomain) => {
    openModal({
      content: (
        <ServiceDomainCrudModal
          organizationId={organizationId}
          projectId={projectId}
          service={service}
          customDomain={customDomain}
          onClose={closeModal}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const onDeleteDomain = (customDomain: CustomDomain) => {
    openModalConfirmation({
      title: 'Delete custom domain',
      confirmationMethod: 'action',
      name: customDomain.domain,
      warning: (
        <>
          <Callout.TextHeading>Domain migration - read this!</Callout.TextHeading>
          <Callout.TextDescription>
            If you are in a migration process and want to assign this domain to another service, deploy the target
            service first to ensure every previous configuration is cleaned up.
          </Callout.TextDescription>
        </>
      ),
      action: () => {
        deleteCustomDomain({
          serviceId: service.id,
          customDomainId: customDomain.id,
          serviceType: service.serviceType,
        })
      },
    })
  }

  return (
    <Section className="p-8">
      <div className="space-y-6">
        <SettingsHeading title="Domain" description="Add custom domains to your service.">
          <Button
            size="md"
            variant="solid"
            color="brand"
            type="button"
            onClick={() => openCrudModal()}
            disabled={!canAddDomain}
          >
            Add Domain
            <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
          </Button>
        </SettingsHeading>

        <div className="max-w-content-with-navigation-left space-y-6">
          {checkedCustomDomains?.some(({ error_details }) => error_details) ? (
            <Callout.Root color="red">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.TextHeading>Some domains are in error. Please check the status below.</Callout.TextHeading>
            </Callout.Root>
          ) : null}

          {isLoadingCustomDomains ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-6" />
            </div>
          ) : customDomains && customDomains.length > 0 ? (
            <BlockContent title="Configured domains" classNameContent="space-y-5">
              {customDomains.map((customDomain) => {
                const checkedCustomDomain = checkedCustomDomains?.find(
                  ({ domain_name }) => customDomain.domain === domain_name
                )

                return (
                  <div
                    key={`domain-${customDomain.domain}-${customDomain.id}`}
                    className="flex w-full items-center justify-between gap-3"
                    data-testid="form-row"
                  >
                    <InputText
                      name={`domain-${customDomain.domain}-${customDomain.id}`}
                      className="flex-1 shrink-0 grow"
                      value={customDomain.domain}
                      label="Default Domain"
                      disabled
                    />
                    <Tooltip
                      disabled={isFetchingCheckedCustomDomains}
                      content={
                        <div className="max-w-64">
                          <span className="text-xs font-medium">Click to check set-up again.</span>
                          {checkedCustomDomain?.error_details ? (
                            <p className="text-[11px] font-normal">{checkedCustomDomain.error_details}</p>
                          ) : null}
                        </div>
                      }
                    >
                      <Button
                        data-testid="recheck-button"
                        variant="outline"
                        color="neutral"
                        size="lg"
                        type="button"
                        className="group relative h-[52px] w-[52px] justify-center"
                        onClick={() => refetchCheckCustomDomains()}
                      >
                        {isFetchingCheckedCustomDomains ? (
                          <LoaderSpinner className="absolute left-0 right-0 m-auto group-hover:hidden" />
                        ) : checkedCustomDomain?.error_details ? (
                          <Icon
                            iconName="circle-exclamation"
                            iconStyle="regular"
                            className="text-negative group-hover:hidden"
                          />
                        ) : (
                          <Icon iconName="check" className="text-positive group-hover:hidden" />
                        )}
                        <Icon iconName="arrow-rotate-right" className="hidden group-hover:block" />
                      </Button>
                    </Tooltip>
                    <Button
                      data-testid="edit-button"
                      variant="outline"
                      color="neutral"
                      size="lg"
                      type="button"
                      className="h-[52px] w-[52px] justify-center"
                      onClick={() => openCrudModal(customDomain)}
                    >
                      <Icon iconName="gear" iconStyle="regular" />
                    </Button>
                    <Button
                      data-testid="delete-button"
                      variant="outline"
                      color="neutral"
                      size="lg"
                      type="button"
                      className="h-[52px] w-[52px] justify-center"
                      onClick={() => onDeleteDomain(customDomain)}
                    >
                      <Icon iconName="trash" iconStyle="regular" />
                    </Button>
                  </div>
                )
              })}
            </BlockContent>
          ) : !canAddDomain ? (
            <EmptyState
              icon="earth-americas"
              title="No domains configured"
              description="You need at least one exposed port to create a domain."
            >
              <div className="flex items-center gap-3">
                <Link
                  to={noPublicLinkCta.to}
                  params={{ organizationId, projectId, environmentId, serviceId }}
                  className="gap-1"
                  variant="solid"
                  color="brand"
                  as="button"
                  size="xs"
                >
                  {noPublicLinkCta.label}
                  <Icon iconName="arrow-right" className="text-xs" />
                </Link>
                <ExternalLink
                  as="button"
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  href="https://www.qovery.com/docs/configuration/application#custom-domains"
                >
                  Learn more
                </ExternalLink>
              </div>
            </EmptyState>
          ) : (
            <EmptyState
              icon="earth-americas"
              title="No domains are set"
              description="Define a custom domain for your service"
            />
          )}
        </div>
      </div>
    </Section>
  )
}

export default ServiceDomainSettings
