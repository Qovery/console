import { CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { BannerBox, BannerBoxEnum, CopyToClipboard, IconAwesomeEnum, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  link?: string
}

export function CrudModal(props: CrudModalProps) {
  const { control } = useFormContext()

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
            rightElement={props.isEdit && <CopyToClipboard className="text-text-600 text-sm" content={field.value} />}
          />
        )}
      />
      <InputText
        disabled
        className="mb-3"
        name="type"
        value="CNAME"
        label="Type"
        rightElement={<CopyToClipboard className="text-text-600 text-sm" content="CNAME" />}
      />
      {(props.customDomain?.validation_domain || props.link) && (
        <InputText
          disabled
          className="mb-6"
          name="type"
          value={props.isEdit ? props.customDomain?.validation_domain : props.link}
          label="Value"
          rightElement={
            <CopyToClipboard
              className="text-text-600 text-sm"
              content={(props.isEdit ? props.customDomain?.validation_domain : props.link) || ''}
            />
          }
        />
      )}
      <BannerBox
        className="mt-7"
        title="How to config"
        message="You need to configure a CNAME record to your domain based on the domain provided in the “Value” field. Qovery will handle TLS/SSL certificate creation and renewal."
        icon={IconAwesomeEnum.CIRCLE_INFO}
        type={BannerBoxEnum.INFO}
      />
    </ModalCrud>
  )
}

export default CrudModal
