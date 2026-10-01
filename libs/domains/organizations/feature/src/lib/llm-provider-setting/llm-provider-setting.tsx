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
  onChange: (value: string, llmProvider?: LlmProviderResponse) => void
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
  const [localLlmProvider, setLocalLlmProvider] = useState<LlmProviderResponse>()
  const usableLlmProviders = llmProviders.filter(
    (llmProvider) =>
      llmProvider.scope === LlmProviderScope.ORGANIZATION ||
      Boolean(currentUserSub && llmProvider.owner_user_sub === currentUserSub)
  )
  const availableLlmProviders = localLlmProvider
    ? usableLlmProviders.some(({ id }) => id === localLlmProvider.id)
      ? usableLlmProviders.map((provider) => (provider.id === localLlmProvider.id ? localLlmProvider : provider))
      : [...usableLlmProviders, localLlmProvider]
    : usableLlmProviders
  const selectedLlmProvider = availableLlmProviders.find(({ id }) => id === value)

  const openProviderModal = (llmProvider?: LlmProviderResponse) => {
    openModal({
      content: (
        <LlmProviderCreateEditModal
          llmProvider={llmProvider}
          onClose={(response) => {
            if (response) {
              setLocalLlmProvider(response)
              onChange(response.id, response)
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

  if (displayEmptyState && !value && availableLlmProviders.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <EmptyState
          icon="key"
          title="No token available"
          description="You don't have a model provider token yet. Add one to configure this agent task."
          size="sm"
        >
          <Button type="button" size="md" color="neutral" onClick={() => openProviderModal()}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            New token
          </Button>
        </EmptyState>
        {error ? (
          <p role="alert" className="px-3 text-xs text-negative">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
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
            portal
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
              ) : undefined
            }
            menuListButton={{
              title: 'Select token',
              label: 'New token',
              onClick: () => openProviderModal(),
            }}
            onChange={(nextValue) => {
              const providerId = typeof nextValue === 'string' ? nextValue : ''
              onChange(
                providerId,
                availableLlmProviders.find(({ id }) => id === providerId)
              )
            }}
          />
        </div>
        {selectedLlmProvider ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            color="neutral"
            iconOnly
            className="h-[52px] w-[52px]"
            aria-label="Edit token"
            onClick={() => openProviderModal(selectedLlmProvider)}
          >
            <Icon iconName="pen" iconStyle="regular" />
          </Button>
        ) : null}
      </div>
      {children}
    </>
  )
}

export default LlmProviderSetting
