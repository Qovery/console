import {
  type AvailableContainerRegistryResponse,
  ContainerRegistryKindEnum,
  type ContainerRegistryResponse,
} from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum, InputSelect, InputText, InputTextArea, Link, ModalCrud } from '@qovery/shared/ui'
import { logoByRegistryKind } from '../page-organization-container-registries'

export interface CrudModalProps {
  registry?: ContainerRegistryResponse
  availableContainerRegistry: AvailableContainerRegistryResponse[]
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export const getOptionsContainerRegistry = (containerRegistry: AvailableContainerRegistryResponse[]) => {
  if (containerRegistry.length > 0) {
    const options = containerRegistry
      .map(
        (containerRegistry: AvailableContainerRegistryResponse) =>
          ![ContainerRegistryKindEnum.DOCR].includes(containerRegistry.kind as ContainerRegistryKindEnum) && {
            label: containerRegistry.kind || '',
            value: containerRegistry.kind || '',
            icon: <Icon name={logoByRegistryKind(containerRegistry.kind)} width="16px" height="16px" />,
          }
      )
      .filter(Boolean)
    return options as Value[]
  } else {
    return []
  }
}

export function CrudModal(props: CrudModalProps) {
  const { control, watch, setValue } = useFormContext()

  const defaultRegistryUrls = {
    [ContainerRegistryKindEnum.GITLAB_CR]: 'https://registry.gitlab.com',
    [ContainerRegistryKindEnum.GITHUB_CR]: 'https://ghcr.io',
    [ContainerRegistryKindEnum.DOCKER_HUB]: 'https://docker.io',
    [ContainerRegistryKindEnum.GENERIC_CR]: '',
    [ContainerRegistryKindEnum.ECR]: '',
    [ContainerRegistryKindEnum.SCALEWAY_CR]: '',
    [ContainerRegistryKindEnum.PUBLIC_ECR]: '',
  }

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit container registry' : 'Set container registry'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
      howItWorks={
        <>
          <p>
            Connect your private container registry to directly deploy your images. You can also access public container
            registries like DockerHub or AWS ECR. If the registry you need is not in the list and it supports the docker
            login format you can use the “Generic” registry.
          </p>
          <Link
            className="mt-2 font-medium"
            link="https://hub.qovery.com/docs/using-qovery/configuration/organization/container-registry/"
            linkLabel="More information here"
            external
            iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
          />
        </>
      }
    >
      <Controller
        name="name"
        control={control}
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
        control={control}
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
        control={control}
        rules={{
          required: 'Please enter a registry type.',
        }}
        render={({ field, fieldState: { error } }) => (
          <div className="mb-5">
            <InputSelect
              onChange={(value) => {
                setValue('url', defaultRegistryUrls[value as keyof typeof defaultRegistryUrls])
                field.onChange(value)
              }}
              value={field.value}
              label="Type"
              error={error?.message}
              options={getOptionsContainerRegistry(props.availableContainerRegistry)}
              portal
            />
          </div>
        )}
      />
      {watch('kind') && (
        <Controller
          name="url"
          control={control}
          rules={{
            // eslint-disable-next-line no-useless-escape
            value: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
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
              disabled={[
                ContainerRegistryKindEnum.DOCKER_HUB,
                ContainerRegistryKindEnum.GITHUB_CR,
                ContainerRegistryKindEnum.GITLAB_CR,
              ].includes(watch('kind'))}
            />
          )}
        />
      )}
      {[
        ContainerRegistryKindEnum.DOCKER_HUB,
        ContainerRegistryKindEnum.GITHUB_CR,
        ContainerRegistryKindEnum.GITLAB_CR,
        ContainerRegistryKindEnum.GENERIC_CR,
      ].includes(watch('kind')) && (
        <>
          <Controller
            name="config.username"
            control={control}
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
            control={control}
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
                {watch('kind') === ContainerRegistryKindEnum.DOCKER_HUB && (
                  <p className="text-xs text-neutral-350 my-1">
                    We encourage you to set credentials for Docker Hub due to the limits on the pull rate.
                    <Link
                      className="font-medium text-sky-500 block ml-1"
                      size="text-xs"
                      link="https://www.docker.com/increase-rate-limits"
                      linkLabel="See here"
                      iconRightClassName="text-2xs relative top-[1px]"
                      iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
                      external
                    />
                  </p>
                )}
              </div>
            )}
          />
        </>
      )}
      {(watch('kind') === ContainerRegistryKindEnum.ECR || watch('kind') === ContainerRegistryKindEnum.SCALEWAY_CR) && (
        <Controller
          name="config.region"
          control={control}
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
      {watch('kind') === ContainerRegistryKindEnum.ECR && (
        <>
          <Controller
            name="config.access_key_id"
            control={control}
            rules={{
              required: 'Please enter a access key.',
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
            control={control}
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
      {watch('kind') === ContainerRegistryKindEnum.SCALEWAY_CR && (
        <>
          <Controller
            name="config.scaleway_access_key"
            control={control}
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
            control={control}
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
  )
}

export default CrudModal
