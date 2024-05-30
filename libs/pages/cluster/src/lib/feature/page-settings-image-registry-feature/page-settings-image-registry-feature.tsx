import { type ContainerRegistryKindEnum, type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useContainerRegistries, useEditContainerRegistry } from '@qovery/domains/organizations/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, InputText, InputTextArea, Section } from '@qovery/shared/ui'

export function SettingsImageRegistryFeature({ containerRegistry }: { containerRegistry: ContainerRegistryResponse }) {
  const { organizationId = '' } = useParams()
  const { mutate: editContainerRegistry, isLoading: isLoadingEditContainerRegistry } = useEditContainerRegistry()

  const methods = useForm<{
    name: string
    kind: ContainerRegistryKindEnum
    description: string
    config?: {
      username: string
      password: string
    }
  }>({
    mode: 'onChange',
    defaultValues: {
      ...containerRegistry,
    },
  })

  const onSubmit = methods.handleSubmit((containerRegistryRequest) => {
    editContainerRegistry({
      organizationId: organizationId,
      containerRegistryId: containerRegistry.id,
      containerRegistryRequest: {
        name: containerRegistryRequest.name,
        kind: containerRegistryRequest.kind,
        description: containerRegistryRequest.description,
        config: {
          username: containerRegistryRequest.config?.username,
          password: containerRegistryRequest.config?.password,
        },
      },
    })
  })

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Image registry"
          description="This image registry is used to store the built images or mirror the container images deployed on this cluster."
        />
        <FormProvider {...methods}>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Controller
              name="name"
              control={methods.control}
              render={({ field }) => (
                <InputText label="Name" name={field.name} onChange={field.onChange} value={field.value} disabled />
              )}
            />
            <Controller
              name="kind"
              control={methods.control}
              render={({ field }) => (
                <InputText label="Type" name={field.name} onChange={field.onChange} value={field.value} disabled />
              )}
            />
            <Controller
              name="description"
              control={methods.control}
              render={({ field }) => (
                <InputTextArea
                  label="Description"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  disabled
                />
              )}
            />
            <Controller
              name="config.username"
              control={methods.control}
              rules={{ required: true }}
              render={({ field }) => (
                <InputText label="Username" name={field.name} onChange={field.onChange} value={field.value} />
              )}
            />
            <Controller
              name="config.password"
              control={methods.control}
              rules={{ required: true }}
              render={({ field }) => (
                <InputText label="Password" name={field.name} onChange={field.onChange} value={field.value} />
              )}
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                size="lg"
                loading={isLoadingEditContainerRegistry}
                disabled={!methods.formState.isValid}
              >
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </Section>
    </div>
  )
}

export function PageSettingsImageRegistryFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: containerRegistries } = useContainerRegistries({
    organizationId,
  })
  const containerRegistry = containerRegistries?.find((registry) => registry.cluster?.id === clusterId)

  return containerRegistry && <SettingsImageRegistryFeature containerRegistry={containerRegistry} />
}

export default PageSettingsImageRegistryFeature
