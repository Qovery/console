import {
  type AvailableContainerRegistryResponse,
  type Cluster,
  ContainerRegistryKindEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Dropzone, ExternalLink, Icon, InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { useAvailableContainerRegistries } from '../hooks/use-available-container-registries/use-available-container-registries'

export interface ContainerRegistryFormProps {
  fromEditClusterSettings?: boolean
  cluster?: Cluster
  isEdit?: boolean
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

export function ContainerRegistryForm({
  fromEditClusterSettings = false,
  cluster,
  isEdit = false,
}: ContainerRegistryFormProps) {
  const methods = useFormContext()

  const [fileDetails, setFileDetails] = useState<{ name: string; size: number }>()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      if (!file || file.type !== 'application/json') return

      setFileDetails({
        name: file.name,
        size: file.size / 1000,
      })

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const binaryStr = reader.result
        methods.setValue('config.json_credentials', binaryStr !== null ? btoa(binaryStr?.toString()) : undefined, {
          shouldValidate: true,
        })
      }
    },
  })

  const { data: availableContainerRegistries = [] } = useAvailableContainerRegistries()

  const defaultRegistryUrls = {
    [ContainerRegistryKindEnum.GITLAB_CR]: 'https://registry.gitlab.com',
    [ContainerRegistryKindEnum.GITHUB_CR]: 'https://ghcr.io',
    [ContainerRegistryKindEnum.DOCKER_HUB]: 'https://docker.io',
    [ContainerRegistryKindEnum.GENERIC_CR]: '',
    [ContainerRegistryKindEnum.ECR]: '',
    [ContainerRegistryKindEnum.SCALEWAY_CR]: '',
    [ContainerRegistryKindEnum.PUBLIC_ECR]: '',
    [ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY]: '',
  }

  const isEditDirty = isEdit && methods.formState.isDirty
  const watchKind: undefined | ContainerRegistryKindEnum = methods.watch('kind')
  const watchLoginType = methods.watch('config.login_type')
  const isClusterManaged = cluster?.kubernetes === 'MANAGED'
  const isClusterSelfManaged = cluster?.kubernetes === 'SELF_MANAGED'
  const isClusterDemo = cluster?.is_demo
  const isClusterOnPremise = cluster?.cloud_provider === 'ON_PREMISE'

  return (
    <div className="flex flex-col gap-y-4">
      <Controller
        name="name"
        control={methods.control}
        rules={{
          required: 'Please enter a registry name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-name"
            disabled={fromEditClusterSettings}
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
            disabled={fromEditClusterSettings}
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
          <InputSelect
            disabled={fromEditClusterSettings ? !(isClusterSelfManaged && !isClusterDemo && isClusterOnPremise) : false}
            onChange={(value) => {
              methods.setValue('url', defaultRegistryUrls[value as keyof typeof defaultRegistryUrls])
              methods.resetField('config')
              field.onChange(value)
            }}
            value={field.value}
            label="Type"
            error={error?.message}
            options={getOptionsContainerRegistry(
              availableContainerRegistries.filter(({ kind }) =>
                fromEditClusterSettings ? kind === 'GITHUB_CR' || kind === 'GENERIC_CR' : true
              )
            )}
            isSearchable
            portal
          />
        )}
      />
      {watchKind && (
        <Controller
          name="url"
          control={methods.control}
          rules={{
            required: 'Please enter a registry url.',
            validate: (input) =>
              match(watchKind)
                .with('GENERIC_CR', () =>
                  // eslint-disable-next-line no-useless-escape
                  input?.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm)
                )
                .otherwise(() =>
                  // eslint-disable-next-line no-useless-escape
                  input?.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:?#[\]@!\$&'\(\)\*\+,;=.]+$/gm)
                ) !== null || 'URL must be valid and start with «http(s)://»',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-url"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Registry url"
              error={error?.message}
              hint={match(watchKind)
                .with(
                  ContainerRegistryKindEnum.DOCKER_HUB,
                  ContainerRegistryKindEnum.GITHUB_CR,
                  ContainerRegistryKindEnum.GITLAB_CR,
                  ContainerRegistryKindEnum.GENERIC_CR,
                  ContainerRegistryKindEnum.DOCR,
                  () => undefined
                )
                .with(
                  ContainerRegistryKindEnum.ECR,
                  () => 'Expected format: https://<aws_account_id>.dkr.ecr.<region>.amazonaws.com'
                )
                .with(ContainerRegistryKindEnum.SCALEWAY_CR, () => 'Expected format: https://rg.<region>.scw.cloud')
                .with(ContainerRegistryKindEnum.PUBLIC_ECR, () => 'Expected format: https://public.ecr.aws')
                .with(
                  ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
                  () => 'Expected format: https://<region>-docker.pkg.dev'
                )
                .exhaustive()}
              disabled={
                isClusterManaged ||
                match(watchKind)
                  .with(
                    ContainerRegistryKindEnum.DOCKER_HUB,
                    ContainerRegistryKindEnum.GITHUB_CR,
                    ContainerRegistryKindEnum.GITLAB_CR,
                    () => true
                  )
                  .otherwise(() => false) ||
                cluster?.is_demo
              }
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
            name="config.login_type"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                onChange={(value) => {
                  field.onChange(value)
                  methods.setValue('config.username', '')
                  methods.setValue('config.password', '')
                  methods.clearErrors('config.username')
                  methods.clearErrors('config.password')
                }}
                value={field.value}
                label="Login type"
                disabled={cluster?.is_demo}
                error={error?.message}
                options={[
                  {
                    label: 'Account',
                    value: 'ACCOUNT',
                  },
                  {
                    label: 'Anonymous',
                    value: 'ANONYMOUS',
                  },
                ]}
                portal
              />
            )}
          />
          {watchLoginType === 'ACCOUNT' && (
            <>
              <Controller
                name="config.username"
                control={methods.control}
                rules={{
                  required: 'Please enter a username.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-username"
                    type="text"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Username"
                    error={error?.message}
                  />
                )}
                shouldUnregister
              />
              {isEditDirty && (
                <>
                  <hr />
                  <span className="text-sm text-neutral-350">Confirm your password</span>
                </>
              )}
              {(!isEdit || isEditDirty) && (
                <Controller
                  name="config.password"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a password.',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <InputText
                        dataTestId="input-password"
                        type="password"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Password"
                        error={error?.message}
                      />
                      {watchKind === ContainerRegistryKindEnum.DOCKER_HUB && (
                        <p className="my-1 text-xs text-neutral-350">
                          We encourage you to set credentials for Docker Hub due to the limits on the pull rate.
                          <ExternalLink href="https://www.docker.com/increase-rate-limits" className="ml-1" size="xs">
                            See here
                          </ExternalLink>
                        </p>
                      )}
                    </>
                  )}
                  shouldUnregister
                />
              )}
            </>
          )}
        </>
      )}
      {(watchKind === ContainerRegistryKindEnum.ECR ||
        watchKind === ContainerRegistryKindEnum.SCALEWAY_CR ||
        watchKind === ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY) && (
        <Controller
          name="config.region"
          control={methods.control}
          rules={{
            required: 'Please enter a region.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Region"
              error={error?.message}
              disabled={isClusterManaged}
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
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Access key"
                error={error?.message}
              />
            )}
          />
          {isEditDirty && (
            <>
              <hr />
              <span className="text-sm text-neutral-350">Confirm your secret key</span>
            </>
          )}
          {(!isEdit || isEditDirty) && (
            <Controller
              name="config.secret_access_key"
              control={methods.control}
              rules={{
                required: 'Please enter a secret key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret key"
                  error={error?.message}
                />
              )}
            />
          )}
        </>
      )}
      {watchKind === ContainerRegistryKindEnum.SCALEWAY_CR && (
        <>
          <Controller
            name="config.scaleway_project_id"
            control={methods.control}
            rules={{
              required: 'Please enter a Scaleway project id.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Project ID"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="config.scaleway_access_key"
            control={methods.control}
            rules={{
              required: 'Please enter a Scaleway access key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Access key"
                error={error?.message}
              />
            )}
          />
          {isEditDirty && (
            <>
              <hr />
              <span className="text-sm text-neutral-350">Confirm your secret key</span>
            </>
          )}
          {(!isEdit || isEditDirty) && (
            <Controller
              name="config.scaleway_secret_key"
              control={methods.control}
              rules={{
                required: 'Please enter a Scaleway secret key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret key"
                  error={error?.message}
                />
              )}
            />
          )}
        </>
      )}
      {watchKind === ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY && (
        <Controller
          name="config.json_credentials"
          control={methods.control}
          rules={{
            required: 'Please enter your credentials JSON',
          }}
          render={({ field }) => (
            <>
              {!field.value ? (
                <div {...getRootProps()}>
                  <input data-testid="input-credentials-json" className="hidden" {...getInputProps()} />
                  <Dropzone typeFile=".json" isDragActive={isDragActive} />
                </div>
              ) : fileDetails ? (
                <div className="mb-[90px] flex items-center justify-between rounded border border-neutral-200 p-4">
                  <div className="flex items-center pl-2 text-neutral-400">
                    <Icon iconName="file-arrow-down" className="mr-4" />
                    <p className="flex flex-col gap-1">
                      <span className="text-xs font-medium">{fileDetails.name}</span>
                      <span className="text-xs text-neutral-350">{fileDetails.size} Ko</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="md"
                    className="h-7 w-7 justify-center"
                    onClick={() => field.onChange(undefined)}
                  >
                    <Icon iconName="trash" />
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </>
          )}
        />
      )}
    </div>
  )
}

export default ContainerRegistryForm
