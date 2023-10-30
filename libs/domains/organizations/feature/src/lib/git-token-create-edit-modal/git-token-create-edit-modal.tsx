import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ExternalLink, InputSelect, InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'

export interface GitTokenCreateEditModalProps {
  isEdit?: boolean
  onClose: () => void
}

export function GitTokenCreateEditModal({ isEdit, onClose }: GitTokenCreateEditModalProps) {
  const methods = useForm({
    defaultValues: {
      kind: '',
      name: '',
      description: '',
    },
    mode: 'onChange',
  })

  return (
    <ModalCrud
      title={isEdit ? 'Edit git token' : 'Set container registry'}
      onClose={onClose}
      onSubmit={() => {}}
      howItWorks={
        <>
          <p>
            Connect your private container registry to directly deploy your images. You can also access public container
            registries like DockerHub or AWS ECR. If the registry you need is not in the list and it supports the docker
            login format you can use the “Generic” registry.
          </p>
          <ExternalLink
            className="mt-2"
            href="https://hub.qovery.com/docs/using-qovery/configuration/organization/container-registry/"
          >
            More information here
          </ExternalLink>
        </>
      }
    >
      <FormProvider {...methods}>
        <Controller
          name="kind"
          control={methods.control}
          rules={{
            required: 'Please enter a registry type.',
          }}
          render={({ field, fieldState: { error } }) => (
            <div className="mb-5">
              <InputSelect
                onChange={field.onChange}
                value={field.value}
                label="Type"
                error={error?.message}
                options={[]}
                portal
              />
            </div>
          )}
        />
        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a registry name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-name"
              className="mb-5"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Registry name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={methods.control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-5"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Description"
              error={error?.message}
            />
          )}
        />
      </FormProvider>
    </ModalCrud>
  )
}

export default GitTokenCreateEditModal
