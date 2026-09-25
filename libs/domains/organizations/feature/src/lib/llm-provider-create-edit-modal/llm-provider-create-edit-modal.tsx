import { useParams } from '@tanstack/react-router'
import {
  CloudProviderEnum,
  type LlmProviderRequest,
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { IconFlag, InputSelect, InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
import { getAwsLocationFlagCode } from '@qovery/shared/util-js'
import { useCreateLlmProvider } from '../hooks/use-create-llm-provider/use-create-llm-provider'
import { useEditLlmProvider } from '../hooks/use-edit-llm-provider/use-edit-llm-provider'

interface LlmProviderFormValues {
  name: string
  description: string
  type: LlmProviderType
  credential: string
  region: string
  scope: LlmProviderScope
}

export interface LlmProviderCreateEditModalProps {
  onClose: (response?: LlmProviderResponse) => void
  llmProvider?: LlmProviderResponse
}

const PROVIDER_OPTIONS = [
  {
    label: (
      <span className="flex items-center gap-2">
        <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-5 w-5" />
        Anthropic Claude
      </span>
    ),
    value: LlmProviderType.CLAUDE,
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <img src="/assets/ai-tools/bedrock.svg" alt="" aria-hidden="true" className="h-5 w-5" />
        Amazon Bedrock
      </span>
    ),
    value: LlmProviderType.BEDROCK,
  },
]

const SCOPE_OPTIONS = [
  { label: 'Personal', value: LlmProviderScope.USER },
  { label: 'Organization', value: LlmProviderScope.ORGANIZATION },
]

function BedrockRegionSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { data: cloudProviders = [], isError, isLoading } = useCloudProviders()
  const awsRegions = cloudProviders.find(({ short_name }) => short_name === CloudProviderEnum.AWS)?.regions ?? []
  const options = awsRegions.map(({ city, name }) => {
    const flagCode = getAwsLocationFlagCode(name)
    return { label: `${city} (${name})`, value: name, icon: flagCode ? <IconFlag code={flagCode} /> : undefined }
  })

  if (value && !options.some(({ value: region }) => region === value)) {
    const flagCode = getAwsLocationFlagCode(value)
    options.push({ label: value, value, icon: flagCode ? <IconFlag code={flagCode} /> : undefined })
  }

  return (
    <InputSelect
      label="AWS region"
      value={value}
      onChange={(nextValue) => onChange(typeof nextValue === 'string' ? nextValue : '')}
      options={options}
      isLoading={isLoading}
      error={isError ? 'Couldn’t load AWS regions.' : undefined}
      isSearchable
      portal
    />
  )
}

export function LlmProviderCreateEditModal({ onClose, llmProvider }: LlmProviderCreateEditModalProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const isEdit = llmProvider !== undefined
  const { enableAlertClickOutside } = useModal()
  const methods = useForm<LlmProviderFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: llmProvider?.name ?? '',
      description: llmProvider?.description ?? '',
      type: llmProvider?.type ?? LlmProviderType.CLAUDE,
      credential: '',
      region: llmProvider?.type === LlmProviderType.BEDROCK ? llmProvider.region ?? '' : 'eu-west-1',
      scope: llmProvider?.scope ?? LlmProviderScope.USER,
    },
  })
  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const providerChanged = isEdit && methods.watch('type') !== llmProvider.type
  const providerType = methods.watch('type')
  const credentialRequired = !isEdit || providerChanged

  const { mutateAsync: createLlmProvider, isLoading: isCreating } = useCreateLlmProvider()
  const { mutateAsync: editLlmProvider, isLoading: isEditing } = useEditLlmProvider()

  const onSubmit = methods.handleSubmit(async (data) => {
    const credential = data.credential.trim()
    const llmProviderRequest: LlmProviderRequest = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      type: data.type,
      credential: credential || undefined,
      ...(data.type === LlmProviderType.BEDROCK ? { region: data.region.trim() || null } : {}),
      scope: isEdit ? undefined : data.scope,
    }

    try {
      const response = isEdit
        ? await editLlmProvider({ organizationId, llmProviderId: llmProvider.id, llmProviderRequest })
        : await createLlmProvider({ organizationId, llmProviderRequest })
      onClose(response)
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit token' : 'Add token'}
        description="Configure a reusable token for your agent tasks."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCreating || isEditing}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save token' : 'Add token'}
      >
        <div className="space-y-4">
          {!isEdit ? (
            <Controller
              name="scope"
              control={methods.control}
              render={({ field }) => (
                <InputSelect
                  label="Scope"
                  value={field.value}
                  options={SCOPE_OPTIONS}
                  hint={
                    field.value === LlmProviderScope.USER
                      ? 'Only you can use and manage this token.'
                      : 'Members of this organization can use this token.'
                  }
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
          <Controller
            name="name"
            control={methods.control}
            rules={{
              required: 'Please enter a token name.',
              validate: (value) => Boolean(value.trim()) || 'Please enter a token name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Name"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="type"
            control={methods.control}
            render={({ field }) => (
              <InputSelect label="Provider" value={field.value} options={PROVIDER_OPTIONS} onChange={field.onChange} />
            )}
          />
          <Controller
            name="credential"
            control={methods.control}
            rules={
              credentialRequired
                ? {
                    required: 'Please enter a token.',
                    validate: (value) => Boolean(value.trim()) || 'Please enter a token.',
                  }
                : undefined
            }
            render={({ field, fieldState: { error } }) => (
              <InputText
                label={isEdit && !credentialRequired ? 'Token (optional)' : 'Token'}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                type="password"
                hint={
                  providerChanged
                    ? 'Enter a new token for the selected provider.'
                    : isEdit
                      ? 'Leave blank to keep the current token.'
                      : 'Encrypted and never shown again.'
                }
              />
            )}
          />
          {providerType === LlmProviderType.BEDROCK ? (
            <Controller
              name="region"
              control={methods.control}
              render={({ field }) => <BedrockRegionSelect {...field} />}
            />
          ) : null}
          <Controller
            name="description"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <InputTextArea
                label="Description (optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
