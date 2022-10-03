import {
  AvailableContainerRegistryResponse,
  ContainerRegistryKindEnum,
  ContainerRegistryResponse,
} from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Value } from '@qovery/shared/interfaces'
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
          containerRegistry.kind !== ContainerRegistryKindEnum.DOCR && {
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
  const { control, watch } = useFormContext()

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit container registry' : 'Set container registry'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
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
              onChange={field.onChange}
              value={field.value}
              label="Type"
              error={error?.message}
              options={getOptionsContainerRegistry(props.availableContainerRegistry)}
              portal
            />
            {watch('kind') === ContainerRegistryKindEnum.DOCKER_HUB && (
              <p className="text-xs text-text-400 my-1">
                We encourage you to set credentials for Docker Hub due to the limits on the pull rate.
                <Link
                  className="font-medium text-accent2-500 block ml-1"
                  size="text-xs"
                  link="https://www.docker.com/increase-rate-limits"
                  linkLabel="See here"
                  iconRightClassName="text-xxs relative top-[1px]"
                  iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
                  external
                />
              </p>
            )}
          </div>
        )}
      />
      {watch('kind') && watch('kind') !== ContainerRegistryKindEnum.DOCKER_HUB && (
        <Controller
          name="url"
          control={control}
          rules={{
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
            />
          )}
        />
      )}
      {watch('kind') === ContainerRegistryKindEnum.DOCKER_HUB && (
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
