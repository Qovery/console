import { CloudProviderEnum, type KubernetesEnum, PortProtocolEnum } from 'qovery-typescript-axios'
import { type FormEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Callout, Icon, InputSelect, InputText, InputToggle, ModalCrud, Tooltip } from '@qovery/shared/ui'

export interface CrudModalProps {
  kubernetes?: KubernetesEnum
  cloudProvider?: CloudProviderEnum
  currentProtocol?: PortProtocolEnum
  isEdit?: boolean
  isDemo?: boolean
  isMatchingHealthCheck?: boolean
  loading?: boolean
  hidePortName?: boolean
  onClose: () => void
  onSubmit: () => void
}

export function CrudModal({
  kubernetes,
  cloudProvider,
  currentProtocol,
  isEdit,
  isMatchingHealthCheck = false,
  loading,
  onClose,
  onSubmit,
  hidePortName,
  isDemo,
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
    .filter((option) =>
      match(cloudProvider)
        .with(CloudProviderEnum.SCW, () => option.value !== PortProtocolEnum.UDP)
        .with(CloudProviderEnum.GCP, () => true)
        .with(CloudProviderEnum.AWS, () => true)
        .with(CloudProviderEnum.ON_PREMISE, () => true)
        .otherwise(() => false)
    )

  return (
    <ModalCrud
      title={isEdit ? 'Edit port' : 'Set port'}
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
      isEdit={isEdit}
      howItWorks={
        <>
          <p>
            Select the port used by your application. You can expose publicly your service via a specific protocol, a
            dedicated domain will be automatically assigned by Qovery.
          </p>
          <p>
            HTTP/gRPC public Ports are always exposed on the port 443 and if multiple ports are exposed publicly, the
            traffic redirection is done based on the subdomain (assigned via the Port Name field).
          </p>
        </>
      }
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
                    <Icon iconName="shield-check" className="text-green-500 hover:text-green-700" />
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
            portal
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
            className="mb-5 mr-4 flex"
          >
            <InputToggle
              onChange={field.onChange}
              value={field.value}
              title="Publicly exposed"
              description="This port will be exposed over the internet via a URL automatically generated by Qovery."
              forceAlignTop
              small
            />
          </div>
        )}
      />
      {watchPublicly && kubernetes === 'SELF_MANAGED' && cloudProvider === 'ON_PREMISE' && isDemo && (
        <Callout.Root color="sky" className="mb-5">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            This service is deployed on a local demo cluster and it will be accessible only from the machine where the
            cluster is running.
          </Callout.Text>
        </Callout.Root>
      )}
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
                        <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-350" />
                      </div>
                    </Tooltip>
                  )
                }
              />
            )}
          />
          {/* Hide with CSS because we need to keep a default value on the creation payload */}
          <div className={hidePortName ? 'hidden' : ''}>
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
            <p className="mb-5 ml-3 text-xs text-neutral-350">{`Port Name allows to customize the subdomain assigned to reach the application port from the internet. Default value is p<port_number>`}</p>
          </div>
        </>
      )}
      {(watchProtocol === PortProtocolEnum.TCP || watchProtocol === PortProtocolEnum.UDP) && watchPublicly && (
        <Callout.Root className="mt-4" color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Activating this feature will add an extra cost to your cloud provider bill (a Network Load Balancer will be
            created).
          </Callout.Text>
        </Callout.Root>
      )}
      {isMatchingHealthCheck && currentProtocol === watchProtocol && (
        <Callout.Root className="mt-4" color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>The health check will be updated to use the new port value.</Callout.Text>
        </Callout.Root>
      )}
      {isMatchingHealthCheck && currentProtocol !== watchProtocol && (
        <Callout.Root className="mt-4" color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>Please verify the health check configuration.</Callout.Text>
        </Callout.Root>
      )}
    </ModalCrud>
  )
}

export default CrudModal
