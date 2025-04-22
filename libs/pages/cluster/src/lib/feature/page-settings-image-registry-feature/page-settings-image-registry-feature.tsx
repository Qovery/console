import { type ContainerRegistryRequest, type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import {
  ContainerRegistryForm,
  useContainerRegistries,
  useEditContainerRegistry,
} from '@qovery/domains/organizations/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Callout, Icon, Section } from '@qovery/shared/ui'

export function SettingsImageRegistryFeature({ containerRegistry }: { containerRegistry: ContainerRegistryResponse }) {
  const { organizationId = '', clusterId = '' } = useParams()
  const { mutate: editContainerRegistry, isLoading: isLoadingEditContainerRegistry } = useEditContainerRegistry()
  const { data: cluster } = useCluster({ organizationId, clusterId })

  const methods = useForm<ContainerRegistryRequest & { type: 'STATIC' | 'STS' }>({
    mode: 'onChange',
    defaultValues: {
      type: containerRegistry.config?.role_arn ? 'STS' : 'STATIC',
      ...containerRegistry,
    },
  })

  const onSubmit = methods.handleSubmit((containerRegistryRequest) => {
    const { type, ...rest } = containerRegistryRequest
    editContainerRegistry({
      organizationId: organizationId,
      containerRegistryId: containerRegistry.id,
      containerRegistryRequest: {
        ...rest,
        config:
          type === 'STS'
            ? {
                role_arn: containerRegistryRequest.config?.role_arn,
                region: containerRegistryRequest.config?.region,
              }
            : {
                role_arn: undefined,
                ...containerRegistryRequest.config,
              },
      },
    })
  })

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Mirroring registry"
          description="This mirroring registry is used to store the built images or mirror the container images deployed on this cluster."
        />
        <FormProvider {...methods}>
          <form className="flex flex-col" onSubmit={onSubmit}>
            <ContainerRegistryForm fromEditClusterSettings cluster={cluster} />
            {(methods.formState.dirtyFields.kind || methods.formState.dirtyFields.url) && (
              <Callout.Root className="mt-4" color="yellow">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  You will have to delete any image stored in the previous container registry manually
                </Callout.Text>
              </Callout.Root>
            )}
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
