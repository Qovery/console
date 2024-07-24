import { type HelmPortRequestPortsInner, PortProtocolEnum } from 'qovery-typescript-axios'
import { type FormEvent } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface NetworkingPortSettingModalProps {
  port?: HelmPortRequestPortsInner
  onClose: () => void
  onSubmit: (port: HelmPortRequestPortsInner) => void
}

export function NetworkingPortSettingModal({ port, onClose, onSubmit }: NetworkingPortSettingModalProps) {
  const isEdit = !!port
  const methods = useForm({
    defaultValues: {
      internal_port: port?.internal_port ?? '',
      external_port: port?.external_port ?? '443',
      service_name: port?.service_name ?? '',
      namespace: port?.namespace ?? '',
      protocol: port ? port.protocol : PortProtocolEnum.HTTP,
      name: port ? port.name : '',
    },
    mode: 'all',
  })

  const { control, watch, setValue } = methods

  const watchInternalPort = watch('internal_port')
  const watchServiceName = watch('service_name')

  const availableProtocols = [PortProtocolEnum.HTTP, PortProtocolEnum.GRPC].map((protocol) => ({
    label: protocol,
    value: protocol,
  }))

  const namePatternRules = {
    pattern: {
      value: /^[a-z][-a-z0-9]{1,37}$/,
      message:
        'Name format is invalid. It should start with a lowercase letter and contain only lowercase letters, numbers, or hyphens (length: 1-37).',
    },
    maxLength: {
      value: 38, // Adjusted to 38 because regex allows up to 37 characters, and the first character is mandatory.
      message: 'Name cannot exceed 37 characters.',
    },
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit port' : 'Set port'}
        onSubmit={methods.handleSubmit((data) =>
          onSubmit({
            ...data,
            internal_port: Number(data['internal_port']), // need to cast to Number
            external_port: Number(data['external_port']),
          })
        )}
        onClose={onClose}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>Specify:</p>
            <ul className="list-disc pl-4">
              <li>the service name as defined within your chart</li>
              <li>the namespace (the one where the service is deployed)</li>
              <li>the port that should be exposed publicly</li>
              <li>the protocol</li>
            </ul>
            <br />
            <p>
              Qovery will take care of configuring the Kubernetes ingress, create a domain and configure the TLS for
              you.
            </p>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Controller
            name="service_name"
            defaultValue=""
            control={control}
            rules={{
              required: 'Please enter service name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const name = `p${watchInternalPort}-${e.currentTarget.value}`
                  if (name.length < namePatternRules.maxLength.value) {
                    setValue('name', name)
                  }
                  field.onChange(e)
                }}
                value={field.value}
                label="Service name"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="namespace"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Namespace (optional)"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="internal_port"
            defaultValue=""
            control={control}
            rules={{
              required: 'Please enter an internal port.',
              pattern: {
                value: /^[0-9]+$/,
                message: 'Please enter a number.',
              },
              max: {
                value: 5,
                message: 'Port number cannot exceed 5 digits.',
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                type="number"
                name={field.name}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const name = `p${e.currentTarget.value}-${watchServiceName}`
                  if (name.length < namePatternRules.maxLength.value) {
                    setValue('name', name)
                  }
                  field.onChange(e)
                }}
                value={field.value}
                label="Service port"
                error={error?.message}
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
                options={availableProtocols}
                error={error?.message}
                onChange={field.onChange}
                portal
              />
            )}
          />
          <Controller
            name="external_port"
            control={control}
            render={({ field }) => (
              <InputText
                type="number"
                name={field.name}
                onChange={field.onChange}
                value="443"
                label="External port"
                disabled
              />
            )}
          />
          <div>
            <Controller
              name="name"
              defaultValue={watchInternalPort ? `p${watchInternalPort}-${watchServiceName}` : ''}
              control={control}
              rules={{
                required: 'Please enter a port name.',
                ...namePatternRules,
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
            <p className="mb-5 ml-4 text-xs text-neutral-350">{`Port Name allows to customize the subdomain assigned to reach the application
port from the internet. Default value is p<port_number>-<service_name>`}</p>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default NetworkingPortSettingModal
