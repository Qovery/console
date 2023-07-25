import { CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { BannerBox, BannerBoxEnum, IconAwesomeEnum, InputText, Link, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  link?: string
}

export function CrudModal(props: CrudModalProps) {
  const { control, watch } = useFormContext()

  const watchDomain = watch('domain')
  const hideDomain = !watchDomain?.includes('*')

  return (
    <ModalCrud
      title={props.isEdit ? `Domain: ${props.customDomain?.domain}` : 'Set custom DNS name'}
      description="DNS configuration"
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
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
      {(props.customDomain?.validation_domain || props.link) && (
        <div className="w-full rounded-[3px] overflow-hidden">
          <div className="flex items-center h-7 text-xs text-text-200 bg-neutral-darken-500 px-3">
            CNAME configuration
          </div>
          <div className={`font-code bg-neutral-darken-400 px-3 pt-1.5 ${hideDomain ? 'pb-3' : 'pb-1'}`}>
            <div className="mb-2">
              <span className="block text-violet-400 text-xs">{watchDomain} CNAME</span>
              <span className="block text-purple-300 text-xs">
                {props.customDomain?.validation_domain || props.link}
              </span>
            </div>
            {hideDomain && (
              <div>
                <span className="block text-violet-400 text-xs">*.{watchDomain} CNAME</span>
                <span className="block text-purple-300 text-xs">
                  {props.customDomain?.validation_domain || props.link}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <BannerBox
        className="mt-7"
        title="How to config"
        message={
          <div>
            <ol className="list-decimal ml-3">
              <li className="mb-2">
                You need to configure within your DNS two CNAME records pointing to the domain provided by Qovery, as
                shown above. Qovery will handle TLS/SSL certificate creation and renewal. If “*” is not supported by
                your DNS provider, you will have to configure each subdomain manually.
              </li>
              <li>
                If the service needs to expose more than one port publicly, you can define a dedicated subdomain to
                redirect the traffic to each port by setting the “Port Name” value within the port settings.
              </li>
            </ol>
            <Link
              external
              className="font-medium mt-1"
              size="text-xs"
              link="https://hub.qovery.com/guides/getting-started/setting-custom-domain"
              linkLabel="Documentation"
              iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              iconRightClassName="text-2xs relative top-[1px]"
            />
          </div>
        }
        icon={IconAwesomeEnum.CIRCLE_INFO}
        type={BannerBoxEnum.INFO}
      />
    </ModalCrud>
  )
}

export default CrudModal
