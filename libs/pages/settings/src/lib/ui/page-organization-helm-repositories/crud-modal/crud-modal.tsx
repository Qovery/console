import { type AvailableHelmRepositoryResponse, type HelmRepositoryResponse } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputSelect, InputText, InputTextArea, InputToggle, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  repository?: HelmRepositoryResponse
  availableHelmRepositories: AvailableHelmRepositoryResponse[]
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal({ isEdit, onSubmit, onClose, loading, availableHelmRepositories }: CrudModalProps) {
  const { control, watch } = useFormContext()

  return (
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
        control={control}
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
            label="Description (optional)"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="kind"
        control={control}
        rules={{
          required: 'Please enter a repository type.',
        }}
        render={({ field, fieldState: { error } }) => (
          <div className="mb-5">
            <InputSelect
              onChange={(value) => {
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
      {watch('kind') && (
        <Controller
          name="url"
          control={control}
          rules={{
            pattern: new RegExp(
              `^(${
                watch('kind') === 'HTTPS' ? 'http(s)' : 'oci'
              }?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$`,
              'gm'
            ),
            required: 'Please enter a repository url.',
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
      {watch('kind') === 'HTTPS' && (
        <>
          <Controller
            name="config.login"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-login"
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
              </div>
            )}
          />
        </>
      )}
      <Controller
        name="config.skip_tls_verification"
        control={control}
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
  )
}

export default CrudModal
