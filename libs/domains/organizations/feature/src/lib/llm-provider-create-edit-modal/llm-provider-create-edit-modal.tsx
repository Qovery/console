import { useParams } from '@tanstack/react-router'
import {
  type LlmProviderRequest,
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputSelect, InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
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

const BEDROCK_REGION_OPTIONS = [
  { label: 'US East (N. Virginia) — us-east-1', value: 'us-east-1' },
  { label: 'US East (Ohio) — us-east-2', value: 'us-east-2' },
  { label: 'US West (N. California) — us-west-1', value: 'us-west-1' },
  { label: 'US West (Oregon) — us-west-2', value: 'us-west-2' },
  { label: 'Canada (Central) — ca-central-1', value: 'ca-central-1' },
  { label: 'Canada West (Calgary) — ca-west-1', value: 'ca-west-1' },
  { label: 'Mexico (Central) — mx-central-1', value: 'mx-central-1' },
  { label: 'Europe (Frankfurt) — eu-central-1', value: 'eu-central-1' },
  { label: 'Europe (Zurich) — eu-central-2', value: 'eu-central-2' },
  { label: 'Europe (Stockholm) — eu-north-1', value: 'eu-north-1' },
  { label: 'Europe (Milan) — eu-south-1', value: 'eu-south-1' },
  { label: 'Europe (Spain) — eu-south-2', value: 'eu-south-2' },
  { label: 'Europe (Ireland) — eu-west-1', value: 'eu-west-1' },
  { label: 'Europe (London) — eu-west-2', value: 'eu-west-2' },
  { label: 'Europe (Paris) — eu-west-3', value: 'eu-west-3' },
  { label: 'Asia Pacific (Taipei) — ap-east-2', value: 'ap-east-2' },
  { label: 'Asia Pacific (Tokyo) — ap-northeast-1', value: 'ap-northeast-1' },
  { label: 'Asia Pacific (Seoul) — ap-northeast-2', value: 'ap-northeast-2' },
  { label: 'Asia Pacific (Osaka) — ap-northeast-3', value: 'ap-northeast-3' },
  { label: 'Asia Pacific (Mumbai) — ap-south-1', value: 'ap-south-1' },
  { label: 'Asia Pacific (Hyderabad) — ap-south-2', value: 'ap-south-2' },
  { label: 'Asia Pacific (Singapore) — ap-southeast-1', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Sydney) — ap-southeast-2', value: 'ap-southeast-2' },
  { label: 'Asia Pacific (Jakarta) — ap-southeast-3', value: 'ap-southeast-3' },
  { label: 'Asia Pacific (Melbourne) — ap-southeast-4', value: 'ap-southeast-4' },
  { label: 'Asia Pacific (Malaysia) — ap-southeast-5', value: 'ap-southeast-5' },
  { label: 'Asia Pacific (New Zealand) — ap-southeast-6', value: 'ap-southeast-6' },
  { label: 'Asia Pacific (Thailand) — ap-southeast-7', value: 'ap-southeast-7' },
  { label: 'Israel (Tel Aviv) — il-central-1', value: 'il-central-1' },
  { label: 'Middle East (UAE) — me-central-1', value: 'me-central-1' },
  { label: 'Middle East (Bahrain) — me-south-1', value: 'me-south-1' },
  { label: 'Africa (Cape Town) — af-south-1', value: 'af-south-1' },
  { label: 'South America (São Paulo) — sa-east-1', value: 'sa-east-1' },
  { label: 'AWS GovCloud (US-East) — us-gov-east-1', value: 'us-gov-east-1' },
  { label: 'AWS GovCloud (US-West) — us-gov-west-1', value: 'us-gov-west-1' },
].map(({ label, value }) => ({ label: label.replace(' — ', ' '), value }))

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
      region: llmProvider?.region ?? 'eu-west-1',
      scope: llmProvider?.scope ?? LlmProviderScope.USER,
    },
  })
  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const providerChanged = isEdit && methods.watch('type') !== llmProvider.type
  const providerType = methods.watch('type')
  const credentialRequired = !isEdit || providerChanged
  const regionOptions =
    llmProvider?.region && !BEDROCK_REGION_OPTIONS.some(({ value }) => value === llmProvider.region)
      ? [...BEDROCK_REGION_OPTIONS, { label: `${llmProvider.region} (existing region)`, value: llmProvider.region }]
      : BEDROCK_REGION_OPTIONS

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
              render={({ field }) => (
                <InputSelect
                  label="AWS region"
                  value={field.value}
                  onChange={field.onChange}
                  options={regionOptions}
                  isSearchable
                  portal
                />
              )}
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
