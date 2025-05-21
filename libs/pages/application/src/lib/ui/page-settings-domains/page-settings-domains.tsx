import { type CheckedCustomDomainResponse, type CustomDomain } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useIngressDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
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
} from '@qovery/shared/ui'
import { hasPublicPort } from '@qovery/shared/util-services'

export interface PageSettingsDomainsProps {
  onCheckCustomDomains: () => void
  checkedCustomDomains?: CheckedCustomDomainResponse[]
  isFetchingCheckedCustomDomains: boolean
  onAddDomain: () => void
  onEdit: (customDomain: CustomDomain) => void
  onDelete: (customDomain: CustomDomain) => void
  domains?: CustomDomain[]
  loading?: boolean
}

export function PageSettingsDomains(props: PageSettingsDomainsProps) {
  const params = useParams()
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = params
  const { data: service } = useService({ serviceId: applicationId })
  const { data: ingressStatus, isLoading: isIngressStatusLoading } = useIngressDeploymentStatus({
    serviceId: applicationId,
    serviceType: service?.serviceType ?? 'APPLICATION',
  })
  const isLoading = props.loading || isIngressStatusLoading
  const canAddDomain = !isLoading && hasPublicPort(ingressStatus?.status)
  const pathToPortsTab = `${APPLICATION_URL(organizationId, projectId, environmentId, applicationId)}${APPLICATION_SETTINGS_URL}${service?.serviceType === 'HELM' ? APPLICATION_SETTINGS_NETWORKING_URL : APPLICATION_SETTINGS_PORT_URL}`

  return (
    <div className="w-full justify-between">
      <Section className="max-w-content-with-navigation-left  p-8">
        <SettingsHeading title="Domain" description="Add custom domains to your service.">
          <Button size="md" variant="solid" color="brand" onClick={() => props.onAddDomain()} disabled={!canAddDomain}>
            Add Domain
            <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
          </Button>
        </SettingsHeading>
        {props.checkedCustomDomains?.some(({ error_details }) => error_details) && (
          <Callout.Root className="mb-6 mt-2.5" color="red">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.TextHeading className="text-neutral-400">
              Some domains are in error. Please check the status below.
            </Callout.TextHeading>
          </Callout.Root>
        )}
        {isLoading ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : !isLoading && props.domains && props.domains.length > 0 ? (
          <BlockContent title="Configured domains">
            {props.domains &&
              props.domains.map((customDomain, i) => {
                const checkedCustomDomain = props.checkedCustomDomains?.find(
                  ({ domain_name }) => customDomain.domain === domain_name
                )
                return (
                  <div
                    key={`domain-${customDomain.domain}-${customDomain.id}`}
                    className={`flex w-full items-center justify-between gap-3 ${
                      props.domains && props.domains.length !== i + 1 ? 'mb-5' : ''
                    }`}
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
                      disabled={props.isFetchingCheckedCustomDomains}
                      content={
                        <div className="max-w-64">
                          <span className="text-xs font-medium">Click to check set-up again.</span>
                          {checkedCustomDomain?.error_details && (
                            <p className="text-[11px] font-normal">{checkedCustomDomain?.error_details}</p>
                          )}
                        </div>
                      }
                    >
                      <Button
                        data-testid="recheck-button"
                        variant="surface"
                        color="neutral"
                        size="lg"
                        className="group relative h-[52px] w-[52px] justify-center"
                        onClick={() => props.onCheckCustomDomains()}
                      >
                        {props.isFetchingCheckedCustomDomains ? (
                          <LoaderSpinner className="absolute left-0 right-0 m-auto group-hover:hidden" theme="dark" />
                        ) : checkedCustomDomain?.error_details ? (
                          <Icon
                            iconName="circle-exclamation"
                            iconStyle="regular"
                            className="text-red-500 group-hover:hidden"
                          />
                        ) : (
                          <Icon iconName="check" className="text-green-500 group-hover:hidden" />
                        )}
                        <Icon iconName="arrow-rotate-right" className="hidden group-hover:block" />
                      </Button>
                    </Tooltip>
                    <Button
                      data-testid="edit-button"
                      variant="surface"
                      color="neutral"
                      size="lg"
                      className="h-[52px] w-[52px] justify-center"
                      onClick={() => props.onEdit(customDomain)}
                    >
                      <Icon iconName="gear" iconStyle="regular" />
                    </Button>
                    <Button
                      data-testid="delete-button"
                      variant="surface"
                      color="neutral"
                      size="lg"
                      className="h-[52px] w-[52px] justify-center"
                      onClick={() => props.onDelete(customDomain)}
                    >
                      <Icon iconName="trash-alt" iconStyle="regular" />
                    </Button>
                  </div>
                )
              })}
          </BlockContent>
        ) : !canAddDomain ? (
          <div className="flex flex-col items-center gap-5 rounded border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
            <div className="flex flex-col items-center gap-2">
              <Icon iconName="earth-americas" className="text-lg" iconStyle="regular" />
              <div className="flex flex-col items-center">
                <span className="font-medium text-neutral-400">No domains configured</span>
                <span className="text-sm text-neutral-350">You need at least one exposed port to create a domain.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link as="button" className="gap-1" to={pathToPortsTab}>
                Create public port
                <Icon iconName="arrow-right" className="text-xs" />
              </Link>
              <ExternalLink
                as="button"
                type="button"
                variant="outline"
                color="neutral"
                href="https://hub.qovery.com/docs/using-qovery/configuration/application/#custom-domains"
              >
                Learn more
              </ExternalLink>
            </div>
          </div>
        ) : (
          <EmptyState title="No domains are set" description="Define a custom domain for your application" />
        )}
      </Section>
    </div>
  )
}

export default PageSettingsDomains
