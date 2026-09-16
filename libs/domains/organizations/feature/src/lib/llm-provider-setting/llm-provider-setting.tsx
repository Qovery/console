import { useParams } from '@tanstack/react-router'
import { type LlmProviderResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { InputSelect, useModal } from '@qovery/shared/ui'
import { LlmProviderCreateEditModal } from '../llm-provider-create-edit-modal/llm-provider-create-edit-modal'

export interface LlmProviderSettingProps {
  error?: string
  isLoading?: boolean
  llmProviders: LlmProviderResponse[]
  value: string
  onChange: (value: string) => void
}

export function LlmProviderSetting({ error, isLoading, llmProviders, value, onChange }: LlmProviderSettingProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const [createdLlmProvider, setCreatedLlmProvider] = useState<LlmProviderResponse>()
  const availableLlmProviders =
    createdLlmProvider && !llmProviders.some(({ id }) => id === createdLlmProvider.id)
      ? [...llmProviders, createdLlmProvider]
      : llmProviders

  const openCreateModal = () => {
    openModal({
      content: (
        <LlmProviderCreateEditModal
          onClose={(response) => {
            if (response) {
              setCreatedLlmProvider(response)
              onChange(response.id)
            }
            closeModal()
          }}
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  return (
    <InputSelect
      label="Token"
      error={error}
      value={value}
      options={availableLlmProviders.map(({ id, name, description }) => ({
        value: id,
        label: name,
        description,
      }))}
      isClearable
      isSearchable
      isLoading={isLoading}
      placeholder="Select a token"
      hint={
        llmProviders.length === 0 && !isLoading ? (
          <span>
            No token is configured. Create one here or manage tokens in{' '}
            <a
              className="font-medium text-brand hover:underline"
              href={`/organization/${organizationId}/settings/agents/tokens`}
            >
              Agents → Tokens
            </a>
            .
          </span>
        ) : (
          'Select the token this agent task will use.'
        )
      }
      menuListButton={{
        title: 'Select token',
        label: 'New token',
        onClick: openCreateModal,
      }}
      onChange={(nextValue) => onChange(typeof nextValue === 'string' ? nextValue : '')}
    />
  )
}

export default LlmProviderSetting
