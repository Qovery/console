import { CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ClusterAvatar } from '@qovery/domains/clusters/feature'
import { InputSelect, ModalCrud, useModal } from '@qovery/shared/ui'

export interface CloudCredentialsSelectProviderModalProps {
  onSelect: (cloudProvider: CloudProviderEnum) => void
}

export const CloudCredentialsSelectProviderModal = ({ onSelect }: CloudCredentialsSelectProviderModalProps) => {
  const { closeModal } = useModal()
  const cloudProviderOptions = [
    {
      label: 'AWS',
      value: CloudProviderEnum.AWS,
      icon: <ClusterAvatar cloudProvider={CloudProviderEnum.AWS} size="xs" />,
    },
    {
      label: 'GCP',
      value: CloudProviderEnum.GCP,
      icon: <ClusterAvatar cloudProvider={CloudProviderEnum.GCP} size="xs" />,
    },
    {
      label: 'Azure',
      value: CloudProviderEnum.AZURE,
      icon: <ClusterAvatar cloudProvider={CloudProviderEnum.AZURE} size="xs" />,
    },
    {
      label: 'Scaleway',
      value: CloudProviderEnum.SCW,
      icon: <ClusterAvatar cloudProvider={CloudProviderEnum.SCW} size="xs" />,
    },
  ]

  const methods = useForm<{ cloudProvider: CloudProviderEnum }>({
    mode: 'onChange',
    defaultValues: {
      cloudProvider: CloudProviderEnum.AWS,
    },
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Select cloud provider"
        description="Select on which cloud provider you'd like to create a new credential"
        onClose={closeModal}
        onSubmit={methods.handleSubmit(({ cloudProvider }) => {
          closeModal()
          onSelect(cloudProvider)
        })}
        submitLabel="Continue"
      >
        <Controller
          name="cloudProvider"
          control={methods.control}
          rules={{
            required: 'Please select a cloud provider.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Cloud provider"
              options={cloudProviderOptions}
              onChange={(value) => field.onChange(value)}
              value={field.value}
              error={error?.message}
              portal
              isSearchable={false}
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default CloudCredentialsSelectProviderModal
