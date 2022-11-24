import { ServicePort } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Icon, IconAwesomeEnum, InputText, InputToggle, ModalCrud, Tooltip } from '@qovery/shared/ui'

export interface CrudModalProps {
  port?: ServicePort
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control, watch, setValue } = useFormContext()

  const watchPublicly = watch('publicly_accessible')
  const watchExternalPort = watch('external_port')

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  useEffect(() => {
    setValue(`external_port`, watchPublicly ? 443 : undefined)
  }, [watchPublicly, setValue])

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit port' : 'Set port'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="internal_port"
        control={control}
        rules={{
          required: 'Please enter an internal port.',
          pattern: pattern,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            type="number"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Application port"
            error={error?.message}
          />
        )}
      />
      <Controller
        key={`port-${watchPublicly}`}
        name="external_port"
        control={control}
        rules={{
          required: watchPublicly ? 'Please enter a public port.' : undefined,
          pattern: pattern,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-5"
            type="number"
            name={field.name}
            onChange={field.onChange}
            value={watchExternalPort} // passing a watch here because setValue with undefined does not work: https://github.com/react-hook-form/react-hook-form/issues/8133
            label="External port"
            error={error?.message}
            disabled
            rightElement={
              <Tooltip content="Only HTTP protocol is supported">
                <div>
                  <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                </div>
              </Tooltip>
            }
          />
        )}
      />
      <Controller
        name="publicly_accessible"
        control={control}
        render={({ field }) => (
          <div
            onClick={() => {
              field.onChange(!field.value)
              field.value && setValue('external_port', null)
            }}
            className="flex items-center mr-4 mb-2"
          >
            <InputToggle onChange={field.onChange} value={field.value} title={field.value} small />
            <span className="text-text-600 text-ssm font-medium cursor-pointer">Publicly exposed</span>
          </div>
        )}
      />
    </ModalCrud>
  )
}

export default CrudModal
