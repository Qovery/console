import { CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { CopyToClipboard, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
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
      {props.isEdit && (
        <>
          <InputText
            disabled
            className="mb-3"
            name="type"
            value="CNAME"
            label="Type"
            rightElement={<CopyToClipboard className="text-text-600 text-sm" content="CNAME" />}
          />
          <InputText
            disabled
            className="mb-6"
            name="type"
            value={props.customDomain?.validation_domain}
            label="Value"
            rightElement={
              <CopyToClipboard
                className="text-text-600 text-sm"
                content={props.customDomain?.validation_domain || ''}
              />
            }
          />
        </>
      )}
    </ModalCrud>
  )
}

export default CrudModal
