import posthog from 'posthog-js'
import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { getSecretManagerProvider } from '@qovery/domains/clusters/data-access'
import { useSecretManagerProviderSecrets } from '@qovery/domains/clusters/feature'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { Checkbox, Icon, InputSelect, InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'

export type SecretSourceOption = {
  value: string
  label: string
  tableLabel: string
  icon: 'aws' | 'gcp'
}

export function mapSecretManagersToSources(secretManagers: SecretManagerAccess[]): SecretSourceOption[] {
  return secretManagers.map((manager) => {
    const provider = getSecretManagerProvider(manager)
    return {
      value: manager.id,
      label: manager.name,
      tableLabel: manager.name,
      icon: provider === 'GCP' ? 'gcp' : 'aws',
    }
  })
}

export type AddSecretModalSubmitData = {
  name: string
  description?: string
  filePath?: string
  isFile: boolean
  isJson?: boolean
  reference: string
  secretManagerAccessId: string
}

export type AddSecretModalInitialSecret = {
  name: string
  reference: string
  description?: string
  filePath?: string
}

interface AddSecretModalProps {
  jsonSecrets?: { reference: string; secretManagerAccessId?: string }[]
  secretSources: SecretSourceOption[]
  defaultSource?: SecretSourceOption
  isFile?: boolean
  isJson?: boolean
  mode?: 'create' | 'edit'
  initialSecret?: AddSecretModalInitialSecret
  scope?: VariableScope
  onClose: () => void
  onSubmit: (secret: AddSecretModalSubmitData) => void | Promise<void>
}

type AddSecretFormValues = {
  source: string
  reference: string
  path: string
  secretName: string
  description: string
  acknowledgeEnvironmentSecretCost: boolean
}

export function AddSecretModal({
  secretSources,
  jsonSecrets,
  defaultSource,
  isFile = false,
  isJson = false,
  mode = 'create',
  initialSecret,
  scope,
  onClose,
  onSubmit,
}: AddSecretModalProps) {
  const defaultSourceValue = defaultSource?.value ?? secretSources[0]?.value ?? ''

  const methods = useForm<AddSecretFormValues>({
    defaultValues: {
      source: defaultSourceValue,
      reference: initialSecret?.reference ?? '',
      path: initialSecret?.filePath ?? '',
      secretName: initialSecret?.name ?? '',
      description: initialSecret?.description ?? '',
      acknowledgeEnvironmentSecretCost: false,
    },
    mode: 'onChange',
  })
  const { enableAlertClickOutside } = useModal()
  const [referenceInput, setReferenceInput] = useState('')
  const debouncedReferenceInput = useDebounce(referenceInput, 300)
  const isDirty = methods.formState.isDirty
  const shouldDisplayEnvironmentAcknowledgement = scope === 'ENVIRONMENT' && mode === 'create'

  const secretNameValue = methods.watch('secretName')
  const selectedSourceId = methods.watch('source')
  const {
    data: providerSecrets,
    isError: isProviderSecretsError,
    isFetching: isFetchingProviderSecrets,
  } = useSecretManagerProviderSecrets({
    secretManagerAccessId: selectedSourceId,
    namePrefix: debouncedReferenceInput,
    enabled: Boolean(selectedSourceId),
    retry: false,
  })

  const sourceOptions = useMemo(
    () =>
      secretSources.map((option) => ({
        label: option.tableLabel,
        value: option.value,
        icon: (
          <Icon
            name={match(option.icon)
              .with('aws', () => 'AWS' as const)
              .with('gcp', () => 'GCP' as const)
              .exhaustive()}
            width="16"
            height="16"
          />
        ),
      })),
    [secretSources]
  )

  const referenceOptions = useMemo(
    () =>
      [
        ...new Set([
          ...(providerSecrets?.results ?? []),
          ...(isJson
            ? (jsonSecrets ?? [])
                .filter((secret) => secret.secretManagerAccessId === selectedSourceId)
                .map((secret) => secret.reference)
            : []),
        ]),
      ].map((secret) => ({
        label: secret,
        value: secret,
      })),
    [providerSecrets?.results, isJson, jsonSecrets, selectedSourceId]
  )

  const handleSubmit = methods.handleSubmit(async (data) => {
    const finalReference = (data.reference || referenceInput).trim()
    if (!finalReference) return

    const finalName = data.secretName.trim() || finalReference.split('/').pop()?.toUpperCase() || 'NEW_SECRET'
    const selectedSource = secretSources.find((option) => option.value === data.source) ?? secretSources[0]
    if (!selectedSource) return

    const descriptionValue = data.description.trim()
    const fallbackFilePath = `/vault/secrets/${finalReference.split('/').pop() || 'secret'}`
    const finalPath = data.path.trim() || fallbackFilePath

    try {
      await onSubmit({
        name: finalName,
        description: descriptionValue ? descriptionValue : undefined,
        filePath: isFile ? finalPath : undefined,
        isFile,
        ...(isJson ? { isJson: true } : {}),
        reference: finalReference,
        secretManagerAccessId: selectedSource.value,
      })
      if (!isJson)
        posthog.capture('external-secret-form-submitted', {
          mode,
          scope,
          is_file: isFile,
          success: true,
        })
      onClose()
    } catch (error) {
      if (!isJson)
        posthog.capture('external-secret-form-submitted', {
          mode,
          scope,
          is_file: isFile,
          success: false,
        })
      console.error(error)
    }
  })

  useEffect(() => {
    enableAlertClickOutside(isDirty)
  }, [enableAlertClickOutside, isDirty])

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={match({ isJson, isFile, mode })
          .with({ isJson: true, mode: 'edit' }, () => 'Edit secret as JSON')
          .with({ isJson: true }, () => 'Add secret as JSON')
          .with({ isFile: true, mode: 'edit' }, () => 'Edit secret as file')
          .with({ isFile: true }, () => 'Add secret as file')
          .with({ mode: 'edit' }, () => 'Edit secret')
          .otherwise(() => 'Add secret')}
        description={match({ isJson, isFile })
          .with(
            { isJson: true },
            () => 'Qovery will inject all top-level JSON keys as environment variables at deployment.'
          )
          .with(
            { isFile: true },
            () => 'Qovery will resolve the external secret at deployment and mount it as a file inside your container.'
          )
          .otherwise(() => 'Qovery will resolve the external secret at deployment.')}
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel={mode === 'edit' ? 'Edit secret' : 'Add secret'}
        loading={methods.formState.isSubmitting}
      >
        <>
          <h3 className="mb-2 text-sm font-medium text-neutral-subtle">Secret parameters</h3>
          <Controller
            name="source"
            control={methods.control}
            rules={{ required: 'Please select a source.' }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                className="mb-3 w-full"
                label="Source"
                portal
                options={sourceOptions}
                value={field.value}
                onChange={(value) => field.onChange(value as string)}
                placeholder="Select a source"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="reference"
            control={methods.control}
            rules={{ required: 'Please enter a reference.' }}
            render={({ field, fieldState: { error } }) => (
              <>
                {isProviderSecretsError ? (
                  <InputText
                    className="mb-3 w-full"
                    name={field.name}
                    label="Reference"
                    value={field.value || referenceInput}
                    onChange={(event) => {
                      field.onChange(event.target.value)
                      setReferenceInput(event.target.value)
                    }}
                    error={error?.message}
                  />
                ) : (
                  <InputSelect
                    className="mb-3 w-full"
                    label="Reference"
                    options={referenceOptions}
                    value={field.value}
                    onChange={(value) => {
                      const selected = value as string
                      field.onChange(selected)
                      if (!isJson && !secretNameValue) {
                        const inferredName = selected.split('/').pop()?.toUpperCase()
                        if (inferredName) {
                          methods.setValue('secretName', inferredName, { shouldValidate: true })
                        }
                      }
                    }}
                    onInputChange={(value) => setReferenceInput(value)}
                    isSearchable
                    isCreatable
                    isLoading={isFetchingProviderSecrets || referenceInput !== debouncedReferenceInput}
                    error={error?.message}
                  />
                )}
              </>
            )}
          />

          {isFile && (
            <Controller
              name="path"
              control={methods.control}
              render={({ field }) => (
                <InputText
                  className="mb-3 w-full"
                  name={field.name}
                  label="Path"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          <Controller
            name="secretName"
            control={methods.control}
            rules={{ required: isJson ? 'Please enter a display name.' : 'Please enter a secret name.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-3 w-full"
                name={field.name}
                label={isJson ? 'Display name' : 'Secret name'}
                value={field.value}
                onChange={field.onChange}
                hint={
                  isJson
                    ? 'Display name only. Use the JSON keys in your code.'
                    : 'Name that other Qovery services will use'
                }
                error={error?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={methods.control}
            render={({ field }) => (
              <InputTextArea
                className="mb-5 w-full"
                label="Description"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {shouldDisplayEnvironmentAcknowledgement && (
            <div className="mb-3 rounded border border-warning-subtle bg-surface-warning-subtle p-4 text-sm text-neutral">
              <div className="mb-3 flex flex-row gap-3">
                <Icon iconName="triangle-exclamation" iconStyle="regular" className="mt-1 text-warning" />
                <div>
                  <p className="font-medium">Be careful when defining an external secret at environment level:</p>
                  <ul className="list-disc pl-3">
                    <li>The secret value will be fetched individually for each service running in the environment.</li>
                    <li>
                      With many services, this multiplies the number of secret fetches and can significantly increase
                      your cloud costs.
                    </li>
                  </ul>
                  <p className="mt-3">
                    Prefer service-level secrets when only a subset of services need access to the value.
                  </p>
                </div>
              </div>

              <Controller
                name="acknowledgeEnvironmentSecretCost"
                control={methods.control}
                rules={{ validate: (value) => value || 'Please acknowledge the environment-level secret impact.' }}
                render={({ field }) => (
                  <div className="flex flex-row gap-3">
                    <Checkbox
                      name={field.name}
                      id="acknowledge_environment_secret_cost"
                      className="mt-0.5 shrink-0"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <label htmlFor="acknowledge_environment_secret_cost" className="font-medium">
                      I understand the secret can be fetched once per service and may increase cloud costs
                    </label>
                  </div>
                )}
              />
            </div>
          )}
        </>
      </ModalCrud>
    </FormProvider>
  )
}
