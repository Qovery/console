import { PortProtocolEnum, ServicePort } from 'qovery-typescript-axios'
import { FormEvent, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { PortData } from '@qovery/shared/interfaces'
import {
  BannerBox,
  BannerBoxEnum,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  InputToggle,
  ModalCrud,
  Tooltip,
} from '@qovery/shared/ui'

export interface CrudModalProps {
  port?: ServicePort | PortData
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  isSetting?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control, watch, setValue } = useFormContext()

  const watchPublicly = watch('publicly_accessible') || false
  const watchInternalPort = watch('internal_port') || false
  const watchExternalPort = watch('external_port') || ''

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  useEffect(() => {
    setValue('external_port', watchPublicly ? 443 : undefined)
    setValue('protocol', !watchPublicly ? PortProtocolEnum.HTTP : undefined)
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
        defaultValue=""
        control={control}
        rules={{
          required: 'Please enter an internal port.',
          pattern: pattern,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="internal-port"
            className="mb-5"
            type="number"
            name={field.name}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              setValue('name', `p${e.currentTarget.value}`)
              field.onChange(e)
            }}
            value={field.value}
            label="Application port"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="publicly_accessible"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <div
            onClick={() => {
              field.onChange(!field.value)
              field.value && setValue('external_port', null)
            }}
            className="flex items-center mr-4 mb-5"
          >
            <InputToggle onChange={field.onChange} value={field.value} title={field.value} small />
            <span className="text-text-600 text-ssm font-medium cursor-pointer">Publicly exposed</span>
          </div>
        )}
      />
      {watchPublicly && (
        <>
          <Controller
            name="protocol"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Select protocol"
                value={field.value}
                options={Object.keys(PortProtocolEnum).map((value: string) => ({ label: value, value: value }))}
                error={error?.message}
                onChange={field.onChange}
                className="mb-5"
              />
            )}
          />
          <Controller
            key={`port-${watchPublicly}`}
            name="external_port"
            defaultValue=""
            control={control}
            rules={{
              required: watchPublicly ? 'Please enter a public port.' : undefined,
              pattern: pattern,
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                type="number"
                name={field.name}
                onChange={field.onChange}
                value={watchExternalPort} // passing a watch here because setValue with undefined does not work: https://github.com/react-hook-form/react-hook-form/issues/8133
                label="External port"
                error={error?.message}
                disabled
                className="mb-4"
                rightElement={
                  <Tooltip content="You cannot configure the port used externally" side="left">
                    <div>
                      <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                    </div>
                  </Tooltip>
                }
              />
            )}
          />
          <>
            <Controller
              name="name"
              defaultValue={watchInternalPort ? `p${watchInternalPort}` : ''}
              control={control}
              rules={{
                required: 'Please enter a port name.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-1"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Port name"
                  error={error?.message}
                />
              )}
            />
            <p className="text-text-400 text-xs ml-4 mb-5">{`Port Name allows to customize the subdomain assigned to reach the application port from the internet. Default value is p<port_number>`}</p>
          </>
        </>
      )}
      <BannerBox
        className="mt-10"
        icon={IconAwesomeEnum.CIRCLE_INFO}
        type={BannerBoxEnum.INFO}
        title="How to config"
        message="Select the port used by your application. You can expose publicly your service via a specific protocol, a dedicated domain will be automatically assigned by Qovery. Ports are always exposed on the port 443, if multiple ports are exposed publicly the traffic redirection is done based on the called subdomain (configured via the Port Name field)."
      />
    </ModalCrud>
  )
}

export default CrudModal
