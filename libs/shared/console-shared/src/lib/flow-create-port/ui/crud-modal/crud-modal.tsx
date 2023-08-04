import { CloudProviderEnum, PortProtocolEnum } from 'qovery-typescript-axios'
import { FormEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
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
  cloudProvider?: CloudProviderEnum
  currentProtocol?: PortProtocolEnum
  isEdit?: boolean
  isMatchingHealthCheck?: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: () => void
}

export function CrudModal({
  cloudProvider,
  currentProtocol,
  isEdit,
  isMatchingHealthCheck = false,
  loading,
  onClose,
  onSubmit,
}: CrudModalProps) {
  const { control, watch, setValue } = useFormContext()

  const watchProtocol = watch('protocol')
  const watchPublicly = watch('publicly_accessible') || false
  const watchInternalPort = watch('internal_port') || false
  const watchExternalPort = watch('external_port') || ''

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  watch(({ internal_port, protocol, publicly_accessible }, { name }) => {
    if (name === 'publicly_accessible' || name === 'protocol') {
      if (publicly_accessible) {
        setValue(
          'external_port',
          protocol === PortProtocolEnum.TCP || protocol === PortProtocolEnum.UDP ? internal_port : 443
        )
      } else {
        setValue(
          'external_port',
          protocol === PortProtocolEnum.TCP || protocol === PortProtocolEnum.UDP ? undefined : 443
        )
      }
    }

    if (name === 'internal_port') {
      if ((publicly_accessible && protocol === PortProtocolEnum.TCP) || protocol === PortProtocolEnum.UDP) {
        setValue('external_port', internal_port)
      }
    }
  })

  const protocolOptions = Object.keys(PortProtocolEnum)
    .map((value: string) => ({ label: value, value: value }))
    .filter((option) => (cloudProvider === CloudProviderEnum.SCW ? option.value !== PortProtocolEnum.UDP : true))

  return (
    <ModalCrud
      title={isEdit ? 'Edit port' : 'Set port'}
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
      isEdit={isEdit}
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
            rightElement={
              isMatchingHealthCheck && (
                <Tooltip side="left" content="A health check is running on this port">
                  <div>
                    <Icon name={IconAwesomeEnum.SHIELD_CHECK} className="text-success-500 hover:text-success-700" />
                  </div>
                </Tooltip>
              )
            }
          />
        )}
      />
      <Controller
        name="protocol"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            label="Select protocol"
            value={field.value}
            options={protocolOptions}
            error={error?.message}
            onChange={field.onChange}
            className="mb-5"
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
            key={`port-${watchPublicly}`}
            name="external_port"
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
                  watchProtocol !== PortProtocolEnum.TCP &&
                  watchProtocol !== PortProtocolEnum.UDP && (
                    <Tooltip content="You cannot configure the port used externally" side="left">
                      <div>
                        <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                      </div>
                    </Tooltip>
                  )
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
      {(watchProtocol === PortProtocolEnum.TCP || watchProtocol === PortProtocolEnum.UDP) && watchPublicly && (
        <BannerBox
          className="mt-4"
          icon={IconAwesomeEnum.CIRCLE_INFO}
          type={BannerBoxEnum.WARNING}
          message="Activating this feature will add an extra cost to your cloud provider bill (a Network Load Balancer will be created)."
        />
      )}
      {isMatchingHealthCheck && currentProtocol === watchProtocol && (
        <BannerBox
          className="mt-4"
          icon={IconAwesomeEnum.CIRCLE_INFO}
          type={BannerBoxEnum.WARNING}
          message="The health check will be updated to use the new port value."
        />
      )}
      {isMatchingHealthCheck && currentProtocol !== watchProtocol && (
        <BannerBox
          className="mt-4"
          icon={IconAwesomeEnum.CIRCLE_INFO}
          type={BannerBoxEnum.WARNING}
          message="Please verify the health check configuration."
        />
      )}
      <BannerBox
        className="mt-4"
        icon={IconAwesomeEnum.CIRCLE_INFO}
        type={BannerBoxEnum.INFO}
        title="How to config"
        message="Select the port used by your application. You can expose publicly your service via a specific protocol, a dedicated domain will be automatically assigned by Qovery. HTTP/gRPC public Ports are always exposed on the port 443 and if multiple ports are exposed publicly, the traffic redirection is done based on the subdomain (assigned via the Port Name field)."
      />
    </ModalCrud>
  )
}

export default CrudModal
