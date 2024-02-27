import {
  type AvailableContainerRegistryResponse,
  ContainerRegistryKindEnum,
  type ContainerRegistryRequest,
  type ContainerRegistryResponse,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { ExternalLink, Icon, InputSelect, InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { useAvailableContainerRegistries } from '../hooks/use-available-container-registries/use-available-container-registries'
import { useCreateContainerRegistry } from '../hooks/use-create-container-registry/use-create-container-registry'
import { useEditContainerRegistry } from '../hooks/use-edit-container-registry/use-edit-container-registry'

export interface ContainerRegistryCreateEditModalProps {
  onClose: () => void
  organizationId: string
  isEdit?: boolean
  registry?: ContainerRegistryResponse
  onChange?: (e: string | string[]) => void
}

export const getOptionsContainerRegistry = (containerRegistry: AvailableContainerRegistryResponse[]) =>
  containerRegistry
    .map((containerRegistry: AvailableContainerRegistryResponse) => ({
      label: containerRegistry.kind || '',
      value: containerRegistry.kind || '',
      icon: (
        <Icon
          name={containerRegistry.kind ? containerRegistryKindToIcon(containerRegistry.kind) : IconEnum.AWS}
          width="16px"
          height="16px"
        />
      ),
    }))
    .filter(Boolean)

export function ContainerRegistryCreateEditModal({
  isEdit,
  registry,
  organizationId,
  onClose,
  onChange,
}: ContainerRegistryCreateEditModalProps) {
  const methods = useForm<ContainerRegistryRequest>({
    mode: 'onChange',
    defaultValues: {
      name: registry?.name,
      description: registry?.description,
      url: registry?.url,
      kind: registry?.kind,
      config: {
        username: undefined,
        password: undefined,
        region: undefined,
        access_key_id: undefined,
        secret_access_key: undefined,
        scaleway_access_key: undefined,
        scaleway_secret_key: undefined,
      },
    },
  })

  const { data: availableContainerRegistries = [] } = useAvailableContainerRegistries()
  const { mutateAsync: editContainerRegistry, isLoading: isLoadingEditContainerRegistry } = useEditContainerRegistry()
  const { mutateAsync: createContainerRegistry, isLoading: isLoadingCreateContainerRegistry } =
    useCreateContainerRegistry()

  useEffect(() => {
    setTimeout(() => methods.clearErrors('config'), 0)
  }, [methods])

  const onSubmit = methods.handleSubmit(async (containerRegistryRequest) => {
    try {
      if (registry) {
        await editContainerRegistry({
          organizationId: organizationId,
          containerRegistryId: registry.id,
          containerRegistryRequest,
        })
        onClose()
      } else {
        const response = await createContainerRegistry({
          organizationId: organizationId,
          containerRegistryRequest,
        })
        onChange && onChange(response.id)
        onClose()
      }
    } catch (error) {
      console.error(error)
    }
  })

  const defaultRegistryUrls = {
    [ContainerRegistryKindEnum.GITLAB_CR]: 'https://registry.gitlab.com',
    [ContainerRegistryKindEnum.GITHUB_CR]: 'https://ghcr.io',
    [ContainerRegistryKindEnum.DOCKER_HUB]: 'https://docker.io',
    [ContainerRegistryKindEnum.GENERIC_CR]: '',
    [ContainerRegistryKindEnum.ECR]: '',
    [ContainerRegistryKindEnum.SCALEWAY_CR]: '',
    [ContainerRegistryKindEnum.PUBLIC_ECR]: '',
  }

  const watchKind = methods.watch('kind')

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit container registry' : 'Set container registry'}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingEditContainerRegistry || isLoadingCreateContainerRegistry}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              Connect your private container registry to directly deploy your images. You can also access public
              container registries like DockerHub or AWS ECR. If the registry you need is not in the list and it
              supports the docker login format you can use the “Generic” registry.
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
        <Controller
          name="kind"
          control={methods.control}
          rules={{
            required: 'Please enter a registry type.',
          }}
          render={({ field, fieldState: { error } }) => (
            <div className="mb-5">
              <InputSelect
                onChange={(value) => {
                  methods.setValue('url', defaultRegistryUrls[value as keyof typeof defaultRegistryUrls])
                  methods.resetField('config')
                  field.onChange(value)
                }}
                value={field.value}
                label="Type"
                error={error?.message}
                options={getOptionsContainerRegistry(availableContainerRegistries)}
                portal
              />
            </div>
          )}
        />
        {watchKind && (
          <Controller
            name="url"
            control={methods.control}
            rules={{
              // eslint-disable-next-line no-useless-escape
              pattern: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
              required: 'Please enter a registry url.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-url"
                className="mb-5"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Registry url"
                error={error?.message}
                disabled={match(watchKind)
                  .with(
                    ContainerRegistryKindEnum.DOCKER_HUB,
                    ContainerRegistryKindEnum.GITHUB_CR,
                    ContainerRegistryKindEnum.GITLAB_CR,
                    () => true
                  )
                  .otherwise(() => false)}
              />
            )}
          />
        )}
        {match(watchKind)
          .with(
            ContainerRegistryKindEnum.DOCKER_HUB,
            ContainerRegistryKindEnum.GITHUB_CR,
            ContainerRegistryKindEnum.GITLAB_CR,
            ContainerRegistryKindEnum.GENERIC_CR,
            () => true
          )
          .otherwise(() => false) && (
          <>
            <Controller
              name="config.username"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-username"
                  className="mb-5"
                  type="text"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Username (optional)"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="config.password"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <div className="mb-5">
                  <InputText
                    dataTestId="input-password"
                    className="mb-5"
                    type="password"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Password (optional)"
                    error={error?.message}
                  />
                  {watchKind === ContainerRegistryKindEnum.DOCKER_HUB && (
                    <p className="text-xs text-neutral-350 my-1">
                      We encourage you to set credentials for Docker Hub due to the limits on the pull rate.
                      <ExternalLink href="https://www.docker.com/increase-rate-limits" className="ml-1" size="xs">
                        See here
                      </ExternalLink>
                    </p>
                  )}
                </div>
              )}
            />
          </>
        )}
        {(watchKind === ContainerRegistryKindEnum.ECR || watchKind === ContainerRegistryKindEnum.SCALEWAY_CR) && (
          <Controller
            name="config.region"
            control={methods.control}
            rules={{
              required: 'Please enter a region.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-5"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Region"
                error={error?.message}
              />
            )}
          />
        )}
        {watchKind === ContainerRegistryKindEnum.ECR && (
          <>
            <Controller
              name="config.access_key_id"
              control={methods.control}
              rules={{
                required: 'Please enter an access key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-5"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Access key"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="config.secret_access_key"
              control={methods.control}
              rules={{
                required: 'Please enter a secret key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-5"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret key"
                  error={error?.message}
                />
              )}
            />
          </>
        )}
        {watchKind === ContainerRegistryKindEnum.SCALEWAY_CR && (
          <>
            <Controller
              name="config.scaleway_access_key"
              control={methods.control}
              rules={{
                required: 'Please enter a Scaleway access key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-5"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Access key"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="config.scaleway_secret_key"
              control={methods.control}
              rules={{
                required: 'Please enter a Scaleway secret key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-5"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret key"
                  error={error?.message}
                />
              )}
            />
          </>
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default ContainerRegistryCreateEditModal
