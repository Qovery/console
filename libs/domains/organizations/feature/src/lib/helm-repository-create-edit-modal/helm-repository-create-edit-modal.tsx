import {
  type HelmRepositoryKindEnum,
  type HelmRepositoryRequest,
  type HelmRepositoryResponse,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import {
  ExternalLink,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  ModalCrud,
  useModal,
} from '@qovery/shared/ui'
import { useAvailableHelmRepositories } from '../hooks/use-available-helm-repositories/use-available-helm-repositories'
import { useCreateHelmRepository } from '../hooks/use-create-helm-repository/use-create-helm-repository'
import { useEditHelmRepository } from '../hooks/use-edit-helm-repository/use-edit-helm-repository'

export interface HelmRepositoryCreateEditModalProps {
  onClose: (helmRepositoryResponse?: HelmRepositoryResponse) => void
  organizationId: string
  isEdit?: boolean
  repository?: HelmRepositoryResponse
}

function helmKindToIcon(kind: keyof typeof HelmRepositoryKindEnum) {
  return match(kind)
    .with('OCI_DOCKER_HUB', () => IconEnum.DOCKER)
    .with('OCI_SCALEWAY_CR', () => IconEnum.SCW)
    .with('OCI_GITHUB_CR', () => IconEnum.GITHUB)
    .with('OCI_GITLAB_CR', () => IconEnum.GITLAB)
    .with('OCI_GENERIC_CR', () => IconEnum.GENERIC_REGISTRY)
    .with('OCI_ECR', 'OCI_PUBLIC_ECR', () => IconEnum.AWS)
    .with('HTTPS', () => IconEnum.HELM_OFFICIAL)
    .exhaustive()
}

export function HelmRepositoryCreateEditModal({
  isEdit,
  repository,
  organizationId,
  onClose,
}: HelmRepositoryCreateEditModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { data: availableHelmRepositories = [] } = useAvailableHelmRepositories()
  const { mutateAsync: editHelmRepository, isLoading: isEditHelmRepositoryLoading } = useEditHelmRepository()
  const { mutateAsync: createHelmRepository, isLoading: isCreateHelmRepositoryLoading } = useCreateHelmRepository()
  const loading = isEditHelmRepositoryLoading || isCreateHelmRepositoryLoading

  const methods = useForm<HelmRepositoryRequest & { config: { login_type: 'ACCOUNT' | 'ANONYMOUS' } }>({
    defaultValues: {
      name: repository?.name,
      description: repository?.description,
      url: repository?.url,
      kind: repository?.kind,
      skip_tls_verification: repository?.skip_tls_verification,
      config: {
        username: repository?.config?.username,
        password: undefined,
        region: repository?.config?.region,
        access_key_id: repository?.config?.access_key_id,
        scaleway_project_id: repository?.config?.scaleway_project_id,
        scaleway_access_key: repository?.config?.scaleway_access_key,
        scaleway_secret_key: undefined,
        secret_access_key: undefined,
        login_type: repository?.config?.username ? 'ACCOUNT' : 'ANONYMOUS',
      },
    },
    mode: 'onChange',
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const watchKind = methods.watch('kind')
  const watchLoginType = methods.watch('config.login_type')

  const onSubmit = methods.handleSubmit(async (helmRepositoryRequest) => {
    // Close without edit when no changes
    if (!methods.formState.isDirty) {
      onClose()
      return
    }

    // Omit `login_type` in the request
    const { login_type, ...config } = helmRepositoryRequest.config
    try {
      if (repository) {
        const response = await editHelmRepository({
          organizationId: organizationId,
          helmRepositoryId: repository.id,
          helmRepositoryRequest: {
            ...helmRepositoryRequest,
            config: config,
          },
        })
        onClose(response)
      } else {
        const response = await createHelmRepository({
          organizationId: organizationId,
          helmRepositoryRequest: {
            ...helmRepositoryRequest,
            config: config,
          },
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })
  const isEditDirty = isEdit && methods.formState.isDirty

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit helm repository' : 'Set helm repository'}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              You can define here the repository (HTTPS or OCI) that you want to use within your organization to deploy
              your helm charts.
            </p>
            <p>You can create a new repository by defining:</p>
            <ul className="mb-2 ml-3 list-inside list-disc">
              <li>its name and description</li>
              <li>kind (HTTPS or OCI)</li>
              <li>the repository URL (Starting with https:// or oci://)</li>
              <li>the credentials</li>
              <li>the skip TLS verification option (to activate the helm argument --insecure-skip-tls-verify)</li>
            </ul>
            <ExternalLink
              className="mt-2"
              href="https://hub.qovery.com/docs/using-qovery/configuration/organization/helm-repository/"
            >
              More information here
            </ExternalLink>
          </>
        }
      >
        <div className="flex flex-col gap-y-4">
          <Controller
            name="name"
            control={methods.control}
            rules={{
              required: 'Please enter a repository name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Repository name"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <InputTextArea
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Description (optional)"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="kind"
            control={methods.control}
            rules={{
              required: 'Please enter a repository type.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                onChange={(value) => {
                  methods.resetField('config')
                  field.onChange(value)
                  methods.setValue('url', '')
                  methods.clearErrors('url')
                }}
                value={field.value}
                label="Kind"
                error={error?.message}
                options={availableHelmRepositories.map(({ kind }) => ({
                  label: kind,
                  value: kind,
                  icon: <Icon name={helmKindToIcon(kind)} width="16px" height="16px" />,
                }))}
                portal
              />
            )}
          />
          {watchKind && (
            <Controller
              name="url"
              control={methods.control}
              rules={{
                required: 'Please enter a repository url.',
                validate: (input) => {
                  const regex = match(watchKind)
                    .with(
                      'HTTPS',
                      () =>
                        new RegExp(
                          `^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$`,
                          'gm'
                        )
                    )
                    .otherwise(
                      () =>
                        new RegExp(
                          `^(oci?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$`,
                          'gm'
                        )
                    )
                  return (
                    input?.match(regex) !== null ||
                    `URL must be valid and start with «${watchKind === 'HTTPS' ? 'http(s)' : 'oci'}://»`
                  )
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-url"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Repository url"
                  hint={match(watchKind)
                    .with('OCI_GENERIC_CR', 'OCI_GITHUB_CR', 'OCI_GITLAB_CR', () => undefined)
                    .with('HTTPS', () => 'Example: https://helm.datadoghq.com or https://grafana.github.io/helm-charts')
                    .with('OCI_ECR', () => 'Expected format: oci://<aws_account_id>.dkr.ecr.<region>.amazonaws.com')
                    .with('OCI_SCALEWAY_CR', () => 'Expected format: oci://rg.<region>.scw.cloud')
                    .with('OCI_DOCKER_HUB', () => 'Expected format: oci://registry-1.docker.io')
                    .with('OCI_PUBLIC_ECR', () => 'Expected format: oci://public.ecr.aws')
                    .exhaustive()}
                  error={error?.message}
                />
              )}
            />
          )}
          {match(watchKind)
            .with('HTTPS', 'OCI_DOCKER_HUB', 'OCI_GENERIC_CR', 'OCI_GITHUB_CR', 'OCI_GITLAB_CR', () => true)
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
                        <InputText
                          dataTestId="input-password"
                          type="password"
                          name={field.name}
                          onChange={field.onChange}
                          value={field.value}
                          label="Password"
                          error={error?.message}
                        />
                      )}
                      shouldUnregister
                    />
                  )}
                </>
              )}
            </>
          )}
          {watchKind === 'OCI_SCALEWAY_CR' && (
            <>
              <Controller
                name="config.region"
                control={methods.control}
                rules={{
                  required: 'Please enter a region.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-region"
                    type="text"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Region"
                    error={error?.message}
                  />
                )}
              />
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
                    dataTestId="input-scaleway_access_key"
                    type="text"
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
                      dataTestId="input-scaleway_secret_key"
                      type="password"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      label="Secret access key"
                      error={error?.message}
                    />
                  )}
                />
              )}
            </>
          )}
          {watchKind === 'OCI_ECR' && (
            <>
              <Controller
                name="config.region"
                control={methods.control}
                rules={{
                  required: 'Please enter a region.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-region"
                    type="text"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Region"
                    error={error?.message}
                  />
                )}
              />
              <Controller
                name="config.access_key_id"
                control={methods.control}
                rules={{
                  required: 'Please enter an access key.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-access_key_id"
                    type="text"
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
                      dataTestId="input-secret_access_key"
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
          <Controller
            name="skip_tls_verification"
            control={methods.control}
            render={({ field }) => (
              <InputToggle
                small
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                title="Skip TLS verification"
                description="skip tls certificate checks for the repository (--insecure-skip-tls-verify)"
                forceAlignTop
              />
            )}
          />
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default HelmRepositoryCreateEditModal
