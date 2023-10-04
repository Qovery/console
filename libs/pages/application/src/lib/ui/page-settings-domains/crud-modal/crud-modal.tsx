import { type CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputText, InputToggle, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  link?: string
}

export function CrudModal({ customDomain, onSubmit, onClose, loading, isEdit, link }: CrudModalProps) {
  const { control, watch } = useFormContext()

  const watchDomain = watch('domain')
  const hideDomain = !watchDomain?.includes('*')

  return (
    <ModalCrud
      title={isEdit ? `Domain: ${customDomain?.domain}` : 'Set custom DNS name'}
      description="DNS configuration"
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
      isEdit={isEdit}
      howItWorks={
        <>
          <ol className="list-decimal ml-3">
            <li className="mb-2">
              You need to configure within your DNS two CNAME records pointing to the domain provided by Qovery, as
              shown above. Qovery will handle TLS/SSL certificate creation and renewal. If “*” is not supported by your
              DNS provider, you will have to configure each subdomain manually.
            </li>
            <li className="mb-2">
              If the service needs to expose more than one port publicly, you can define a dedicated subdomain to
              redirect the traffic to each port by setting the “Port Name” value within the port settings.
            </li>
            <li>
              If you don’t want Qovery to manage the certificate for this custom domain, disable the “Generate
              Certificate” flag. Disabling this flag is necessary whenever your service is behind a CDN that already
              manages the certificate for you and the traffic is proxied by the CDN to the Qovery domain.
            </li>
          </ol>
          <ExternalLink className="mt-2 " href="https://hub.qovery.com/guides/getting-started/setting-custom-domain">
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
          />
        )}
      />
      {(customDomain?.validation_domain || link) && (
        <div className="w-full rounded-[3px] overflow-hidden">
          <div className="flex items-center h-7 text-xs text-neutral-100 bg-neutral-700 px-3">CNAME configuration</div>
          <div className={`font-code bg-neutral-650 px-3 pt-1.5 ${hideDomain ? 'pb-3' : 'pb-1'}`}>
            <div className="mb-2">
              <span className="block text-violet-400 text-xs">{watchDomain} CNAME</span>
              <span className="block text-purple-300 text-xs">{customDomain?.validation_domain || link}</span>
            </div>
            {hideDomain && (
              <div>
                <span className="block text-violet-400 text-xs">*.{watchDomain} CNAME</span>
                <span className="block text-purple-300 text-xs">{customDomain?.validation_domain || link}</span>
              </div>
            )}
          </div>
        </div>
      )}
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
  )
}

export default CrudModal
