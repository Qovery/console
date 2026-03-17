import { type CustomDomain, type CustomDomainRequest } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCreateCustomDomain, useEditCustomDomain } from '@qovery/domains/custom-domains/feature'
import { type Application, type Container, type Helm } from '@qovery/domains/services/data-access'
import { useLinks } from '@qovery/domains/services/feature'
import { ExternalLink, InputText, InputToggle, ModalCrud, useModal } from '@qovery/shared/ui'

export interface ServiceDomainCrudModalProps {
  organizationId: string
  projectId: string
  service: Application | Container | Helm
  customDomain?: CustomDomain
  onClose: () => void
}

export function ServiceDomainCrudModal({
  organizationId,
  projectId,
  service,
  customDomain,
  onClose,
}: ServiceDomainCrudModalProps) {
  const methods = useForm<CustomDomainRequest>({
    defaultValues: {
      domain: customDomain?.domain ?? '',
      generate_certificate: customDomain?.generate_certificate ?? true,
      use_cdn: customDomain?.use_cdn ?? false,
    },
    mode: 'onChange',
  })

  const { enableAlertClickOutside } = useModal()
  const { data: links = [] } = useLinks({
    serviceId: service.id,
    serviceType: service.serviceType,
  })
  const { mutateAsync: createCustomDomain, isLoading: isLoadingCreateCustomDomain } = useCreateCustomDomain({
    organizationId,
    projectId,
    environmentId: service.environment.id,
  })
  const { mutateAsync: editCustomDomain, isLoading: isLoadingEditCustomDomain } = useEditCustomDomain({
    organizationId,
    projectId,
    environmentId: service.environment.id,
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState.isDirty, enableAlertClickOutside])

  const { control, watch, setValue } = methods
  const defaultLink = useMemo(() => {
    const defaultLinkItem = links.find((link) => link.is_qovery_domain && link.is_default)
    return defaultLinkItem?.url?.replace('https://', '') || ''
  }, [links])
  const watchDomain = watch('domain')
  const showWildcardCname = Boolean(watchDomain) && !watchDomain.includes('*')
  const cnameTarget = customDomain?.validation_domain || defaultLink

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (customDomain) {
        await editCustomDomain({
          serviceId: service.id,
          serviceType: service.serviceType,
          customDomainId: customDomain.id,
          payload: data,
        })
      } else {
        await createCustomDomain({
          serviceId: service.id,
          serviceType: service.serviceType,
          payload: data,
        })
      }

      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={customDomain ? `Domain: ${customDomain.domain}` : 'Set custom DNS name'}
        description="DNS configuration"
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingCreateCustomDomain || isLoadingEditCustomDomain}
        isEdit={Boolean(customDomain)}
        howItWorks={
          <>
            <ol className="ml-4 list-decimal space-y-2 text-neutral-subtle">
              <li>
                Configure two CNAME records in your DNS provider pointing to the Qovery domain shown below. Qovery will
                manage TLS/SSL certificate creation and renewal.
              </li>
              <li>
                If your service exposes more than one public port, you can assign a dedicated subdomain to each port via
                the port settings.
              </li>
              <li>
                If a CDN or DNS proxy already manages the certificate, disable certificate generation for this domain.
              </li>
            </ol>
            <ExternalLink className="mt-3" href="https://www.qovery.com/docs/configuration/application#custom-domains">
              Documentation
            </ExternalLink>
          </>
        }
      >
        <Controller
          name="domain"
          control={control}
          rules={{
            required: 'Please enter a domain',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Domain"
              error={error?.message}
              autoFocus
            />
          )}
        />

        {cnameTarget ? (
          <div className="overflow-hidden rounded-md border border-neutral">
            <div className="border-b border-neutral bg-surface-neutral-subtle px-4 py-2 text-xs font-medium text-neutral">
              CNAME configuration
            </div>
            <div className="space-y-3 bg-surface-neutral px-4 pb-3 pt-2 font-code text-xs">
              <div>
                <span className="block text-brand-9">{watchDomain || '<your-domain>'} CNAME</span>
                <span className="block text-brand-12">{cnameTarget}</span>
              </div>
              {showWildcardCname ? (
                <div>
                  <span className="block text-brand-9">*.{watchDomain} CNAME</span>
                  <span className="block text-brand-12">{cnameTarget}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <Controller
          name="use_cdn"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="mt-6"
              value={field.value}
              onChange={(value) => {
                if (value) {
                  setValue('generate_certificate', false, { shouldDirty: true, shouldValidate: true })
                }
                field.onChange(value)
              }}
              title="Domain behind a CDN or DNS proxy (e.g. Cloudflare, CloudFront, Route 53)"
              description="Check this if the traffic on this domain is managed by a CDN or DNS proxy."
              forceAlignTop
              small
            />
          )}
        />

        <Controller
          name="generate_certificate"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="mt-6"
              value={field.value}
              onChange={field.onChange}
              title="Generate certificate"
              description="Qovery will generate and manage the certificate for this domain."
              forceAlignTop
              small
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ServiceDomainCrudModal
