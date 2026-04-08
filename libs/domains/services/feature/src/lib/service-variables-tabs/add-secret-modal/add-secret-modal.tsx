import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Icon, InputSelect, InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'

export interface ExternalSecret {
  id: string
  name: string
  description?: string
  filePath?: string
  isFile?: boolean
  reference: string
  source: string | null
  sourceIcon?: string
  scope: 'Application' | 'Environment'
}

export type SecretSourceOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  tableLabel: string
  icon: 'aws' | 'gcp'
}

export const SECRET_SOURCES: SecretSourceOption[] = [
  {
    value: 'aws-manager',
    label: 'AWS Secret manager',
    tableLabel: 'Prod secret manager',
    icon: 'aws',
  },
  {
    value: 'aws-parameter',
    label: 'AWS Parameter store',
    tableLabel: 'AWS Parameter store',
    icon: 'aws',
  },
  {
    value: 'gcp-secret',
    label: 'GCP Secret manager',
    tableLabel: 'GCP secret manager',
    icon: 'gcp',
  },
]

const REFERENCE_OPTIONS = [
  'my-app/prod/db-password',
  'my-app/prod/api-key',
  'my-app/prod/secret-token',
  'my-app/prod/user-credentials',
  'my-app/prod/payment-gateway',
  'my-app/prod/db-host',
  'my-app/prod/db-port',
]

interface AddSecretModalProps {
  defaultSource?: SecretSourceOption
  isFile?: boolean
  mode?: 'create' | 'edit'
  initialSecret?: ExternalSecret
  onClose: () => void
  onSubmit: (secret: Omit<ExternalSecret, 'id'>) => void
}

type AddSecretFormValues = {
  source: SecretSourceOption['value']
  reference: string
  path: string
  secretName: string
  description: string
}

export function AddSecretModal({
  defaultSource,
  isFile = false,
  mode = 'create',
  initialSecret,
  onClose,
  onSubmit,
}: AddSecretModalProps) {
  const methods = useForm<AddSecretFormValues>({
    defaultValues: {
      source: defaultSource?.value ?? SECRET_SOURCES[0].value,
      reference: initialSecret?.reference ?? '',
      path: initialSecret?.filePath ?? '',
      secretName: initialSecret?.name ?? '',
      description: initialSecret?.description ?? '',
    },
    mode: 'onChange',
  })
  const { enableAlertClickOutside } = useModal()
  const [referenceInput, setReferenceInput] = useState('')
  const isDirty = methods.formState.isDirty
  const trigger = methods.trigger

  const secretNameValue = methods.watch('secretName')

  const handleSubmit = methods.handleSubmit((data) => {
    const finalReference = data.reference || referenceInput || REFERENCE_OPTIONS[0]
    const finalName = data.secretName.trim() || finalReference.split('/').pop()?.toUpperCase() || 'NEW_SECRET'
    const selectedSource = SECRET_SOURCES.find((option) => option.value === data.source) ?? SECRET_SOURCES[0]
    const descriptionValue = data.description.trim()
    const fallbackFilePath = `/vault/secrets/${finalReference.split('/').pop() || 'secret'}`
    const finalPath = data.path.trim() || fallbackFilePath

    onSubmit({
      name: finalName,
      description: descriptionValue ? descriptionValue : undefined,
      filePath: isFile ? finalPath : undefined,
      isFile,
      reference: finalReference,
      source: selectedSource.tableLabel,
      sourceIcon: selectedSource.icon,
      scope: 'Application',
    })
    onClose()
  })

  useEffect(() => {
    enableAlertClickOutside(isDirty)
  }, [enableAlertClickOutside, isDirty])

  useEffect(() => {
    trigger().then()
  }, [trigger])

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={
          isFile
            ? mode === 'edit'
              ? 'Edit secret as file'
              : 'Add secret as file'
            : mode === 'edit'
              ? 'Edit secret'
              : 'Add secret'
        }
        description={
          isFile
            ? mode === 'edit'
              ? 'Edit an external secret file to use on this service. Qovery will resolve its value at deployment and mount it inside your container.'
              : 'Add an external secret file to use on this service. Qovery will resolve its value at deployment and mount it inside your container.'
            : mode === 'edit'
              ? 'Edit an external secret to use on this service. Qovery will resolve its value at deployment.'
              : 'Add an external secret to use on this service. Qovery will resolve its value at deployment.'
        }
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel={mode === 'edit' ? 'Edit secret' : 'Add secret'}
      >
        <>
          <Controller
            name="source"
            control={methods.control}
            render={({ field }) => (
              <InputSelect
                className="mb-3 w-full"
                label="Source"
                portal
                options={SECRET_SOURCES.map((option) => ({
                  label: option.label,
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
                }))}
                value={field.value}
                onChange={(value) => field.onChange(value as SecretSourceOption['value'])}
                placeholder="Select a source"
              />
            )}
          />

          <Controller
            name="reference"
            control={methods.control}
            render={({ field }) => (
              <InputSelect
                className="mb-3 w-full"
                label="Reference"
                options={REFERENCE_OPTIONS.map((reference) => ({ label: reference, value: reference }))}
                value={field.value}
                onChange={(value) => {
                  const selected = value as string
                  field.onChange(selected)
                  if (!secretNameValue) {
                    const inferredName = selected.split('/').pop()?.toUpperCase()
                    if (inferredName) {
                      methods.setValue('secretName', inferredName, { shouldValidate: true })
                    }
                  }
                }}
                onInputChange={(value) => setReferenceInput(value)}
                isSearchable
                isCreatable
                placeholder="Reference"
              />
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
            render={({ field }) => (
              <InputText
                className="mb-3 w-full"
                name={field.name}
                label="Secret name"
                value={field.value}
                onChange={field.onChange}
                hint="Name that other Qovery services will use"
              />
            )}
          />

          <Controller
            name="description"
            control={methods.control}
            render={({ field }) => (
              <InputTextArea
                className="mb-6 w-full"
                label="Description"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </>
      </ModalCrud>
    </FormProvider>
  )
}

export default AddSecretModal
