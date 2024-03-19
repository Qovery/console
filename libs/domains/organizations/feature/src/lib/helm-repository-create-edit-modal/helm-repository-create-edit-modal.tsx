import { type HelmRepositoryRequest, type HelmRepositoryResponse } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { ExternalLink, InputSelect, InputText, InputTextArea, InputToggle, ModalCrud } from '@qovery/shared/ui'
import { useAvailableHelmRepositories } from '../hooks/use-available-helm-repositories/use-available-helm-repositories'
import { useCreateHelmRepository } from '../hooks/use-create-helm-repository/use-create-helm-repository'
import { useEditHelmRepository } from '../hooks/use-edit-helm-repository/use-edit-helm-repository'

export interface HelmRepositoryCreateEditModalProps {
  onClose: (helmRepositoryResponse?: HelmRepositoryResponse) => void
  organizationId: string
  isEdit?: boolean
  repository?: HelmRepositoryResponse
}

export function HelmRepositoryCreateEditModal({
  isEdit,
  repository,
  organizationId,
  onClose,
}: HelmRepositoryCreateEditModalProps) {
  const { data: availableHelmRepositories = [] } = useAvailableHelmRepositories()
  const { mutateAsync: editHelmRepository, isLoading: isEditHelmRepositoryLoading } = useEditHelmRepository()
  const { mutateAsync: createHelmRepository, isLoading: isCreateHelmRepositoryLoading } = useCreateHelmRepository()
  const loading = isEditHelmRepositoryLoading || isCreateHelmRepositoryLoading

  const methods = useForm<HelmRepositoryRequest>({
    defaultValues: {
      name: repository?.name,
      description: repository?.description,
      url: repository?.url,
      kind: repository?.kind,
      skip_tls_verification: repository?.skip_tls_verification,
      config: {
        username: undefined,
        password: undefined,
        region: undefined,
        access_key_id: undefined,
        scaleway_access_key: undefined,
        scaleway_secret_key: undefined,
        secret_access_key: undefined,
      },
    },
    mode: 'onChange',
  })

  const watchKind = methods.watch('kind')

  const onSubmit = methods.handleSubmit(async (helmRepositoryRequest) => {
    try {
      if (repository) {
        const response = await editHelmRepository({
          organizationId: organizationId,
          helmRepositoryId: repository.id,
          helmRepositoryRequest,
        })
        onClose(response)
      } else {
        const response = await createHelmRepository({
          organizationId: organizationId,
          helmRepositoryRequest,
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })

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
            <ul className="list-disc list-inside ml-3 mb-2">
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
        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a repository name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-name"
              className="mb-5"
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
              className="mb-5"
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
            <div className="mb-5">
              <InputSelect
                onChange={(value) => {
                  methods.resetField('config')
                  field.onChange(value)
                }}
                value={field.value}
                label="Kind"
                error={error?.message}
                options={availableHelmRepositories.map(({ kind }) => ({
                  label: kind,
                  value: kind,
                }))}
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
              required: 'Please enter a repository url.',
              validate: (input) => {
                const regex = new RegExp(
                  `^(${
                    watchKind === 'HTTPS' ? 'http(s)' : 'oci'
                  }?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$`,
                  'gm'
                )
                return input?.match(regex) !== null || 'Invalid repository URL'
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-url"
                className="mb-5"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Repository url"
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
                </div>
              )}
            />
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
                  className="mb-5"
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
              name="config.scaleway_access_key"
              control={methods.control}
              rules={{
                required: 'Please enter a Scaleway access key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-scaleway_access_key"
                  className="mb-5"
                  type="text"
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
                  dataTestId="input-scaleway_secret_key"
                  className="mb-5"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret access key"
                  error={error?.message}
                />
              )}
            />
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
                  className="mb-5"
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
                  className="mb-5"
                  type="text"
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
                  dataTestId="input-secret_access_key"
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
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default HelmRepositoryCreateEditModal
