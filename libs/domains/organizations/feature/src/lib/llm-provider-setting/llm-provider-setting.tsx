import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@tanstack/react-router'
import { type LlmProviderResponse, LlmProviderScope } from 'qovery-typescript-axios'
import { type ReactNode, useState } from 'react'
import { Button, EmptyState, Icon, InputSelect, useModal } from '@qovery/shared/ui'
import { LlmProviderCreateEditModal } from '../llm-provider-create-edit-modal/llm-provider-create-edit-modal'

export interface LlmProviderSettingProps {
  children?: ReactNode
  displayEmptyState?: boolean
  error?: string
  isLoading?: boolean
  llmProviders: LlmProviderResponse[]
  value: string
  onChange: (value: string) => void
}

export function LlmProviderSetting({
  children,
  displayEmptyState = false,
  error,
  isLoading,
  llmProviders,
  value,
  onChange,
}: LlmProviderSettingProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { user } = useAuth0()
  const currentUserSub = user?.sub
  const { openModal, closeModal } = useModal()
  const [createdLlmProvider, setCreatedLlmProvider] = useState<LlmProviderResponse>()
  const usableLlmProviders = llmProviders.filter(
    (llmProvider) =>
      llmProvider.scope === LlmProviderScope.ORGANIZATION ||
      Boolean(currentUserSub && llmProvider.owner_user_sub === currentUserSub)
  )
  const availableLlmProviders =
    createdLlmProvider && !usableLlmProviders.some(({ id }) => id === createdLlmProvider.id)
      ? [...usableLlmProviders, createdLlmProvider]
      : usableLlmProviders

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

  if (displayEmptyState && availableLlmProviders.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon="key"
        title="No token available"
        description="You don't have a model provider token yet. Add one to configure this agent task."
        size="sm"
      >
        <Button type="button" size="md" color="neutral" onClick={openCreateModal}>
          <Icon iconName="circle-plus" iconStyle="regular" />
          New token
        </Button>
      </EmptyState>
    )
  }

  return (
    <>
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
          availableLlmProviders.length === 0 && !isLoading ? (
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
      {children}
    </>
  )
}

export default LlmProviderSetting
