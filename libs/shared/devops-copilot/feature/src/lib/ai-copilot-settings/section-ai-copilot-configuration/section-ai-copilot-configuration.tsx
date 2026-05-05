import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { useState } from 'react'
import {
  BlockContent,
  Button,
  Callout,
  Icon,
  InputSelect,
  Link,
  LoaderSpinner,
  RadioGroup,
  Section,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'

export interface SectionAICopilotConfigurationProps {
  organization?: Organization
  isLoading?: boolean
  isUpdating?: boolean
  currentMode: 'read-only' | 'read-write'
  currentTokenMode?: 'jwt' | 'role'
  onModeChange: (mode: 'read-only' | 'read-write') => void
  onTokenModeChange?: (tokenMode: 'jwt' | 'role') => void
  onDisable: () => void
}

function getDisableConfirmationModal(closeModal: () => void, onDisable: () => void) {
  return (
    <div className="p-6">
      <h2 className="mb-2 text-base font-medium text-neutral">Disable AI Copilot</h2>
      <p className="mb-6 text-sm text-neutral-subtle">
        Are you sure you want to disable AI Copilot? This will stop all AI-powered assistance for your organization.
      </p>
      <div className="flex justify-end gap-3">
        <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          color="red"
          onClick={() => {
            closeModal()
            onDisable()
          }}
        >
          Disable
        </Button>
      </div>
    </div>
  )
}

export function SectionAICopilotConfiguration({
  organization,
  isLoading,
  isUpdating,
  currentMode,
  currentTokenMode,
  onModeChange,
  onTokenModeChange,
  onDisable,
}: SectionAICopilotConfigurationProps) {
  const { openModal, closeModal } = useModal()
  const [selectedMode, setSelectedMode] = useState<'read-only' | 'read-write' | null>(null)
  const hasReadWriteAccess = useFeatureFlagVariantKey('copilot-read-write-access')
  const mode = selectedMode ?? currentMode
  const hasUnsavedChanges = selectedMode !== null && selectedMode !== currentMode

  const handleSaveMode = () => {
    if (selectedMode) {
      if (selectedMode === 'read-write' && !hasReadWriteAccess) {
        return
      }
      onModeChange(selectedMode)
      setSelectedMode(null)
    }
  }

  const handleCancelMode = () => {
    setSelectedMode(null)
  }

  const modeOptions = [
    { label: 'Read-Only', value: 'read-only' },
    { label: 'Read-Write', value: 'read-write' },
  ]

  return (
    <Section>
      <BlockContent title="Configuration" classNameContent="p-0" className="m-0">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <LoaderSpinner className="w-5" />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="-mx-6 border-b border-neutral px-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center">
                    <Icon iconName="robot" className="mr-2 text-brand" />
                    <p className="text-sm font-medium text-neutral">AI Copilot for {organization?.name}</p>
                  </div>
                  <p className="text-xs text-neutral-subtle">AI-powered assistance is currently active</p>
                </div>
                <Button
                  size="md"
                  color="red"
                  loading={isUpdating}
                  onClick={() => {
                    openModal({
                      content: getDisableConfirmationModal(closeModal, onDisable),
                    })
                  }}
                >
                  Disable
                </Button>
              </div>
            </div>

            <div className="-mx-6 border-b border-neutral px-6 pb-6">
              <div className="mb-3 flex items-center gap-1">
                <p className="text-sm font-medium text-neutral">Access source</p>
                <Tooltip content="Choose which identity the AI Copilot uses to access your infrastructure.">
                  <span className="relative top-[1px] text-sm text-neutral-subtle">
                    <Icon iconName="circle-question" iconStyle="regular" />
                  </span>
                </Tooltip>
              </div>
              <RadioGroup.Root
                value={currentTokenMode ?? 'jwt'}
                onValueChange={(value) => onTokenModeChange?.(value as 'jwt' | 'role')}
                className="flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <RadioGroup.Item value="jwt" id="token-mode-jwt" className="mt-px" />
                  <label htmlFor="token-mode-jwt" className="cursor-pointer">
                    <p className="text-sm font-medium text-neutral">My account</p>
                    <p className="text-xs text-neutral-subtle">The copilot acts as you, with your own permissions.</p>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroup.Item value="role" id="token-mode-role" className="mt-px" />
                  <label htmlFor="token-mode-role" className="cursor-pointer">
                    <p className="text-sm font-medium text-neutral">Copilot role</p>
                    <p className="text-xs text-neutral-subtle">
                      The copilot uses a dedicated role with controlled permissions.
                    </p>
                  </label>
                </div>
              </RadioGroup.Root>
              {currentTokenMode === 'role' && (
                <p className="mt-3 text-xs text-neutral-subtle">
                  Manage access permissions in{' '}
                  <Link
                    to="/organization/$organizationId/settings/roles"
                    params={{ organizationId: organization?.id ?? '' }}
                    color="brand"
                    size="xs"
                    underline
                  >
                    Roles settings
                  </Link>
                  .
                </p>
              )}
            </div>

            <div className="space-y-4">
              {hasReadWriteAccess && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral">Access Mode</label>
                    <p className="text-xs text-neutral-subtle">
                      Choose the level of access the AI Copilot will have on your organization
                    </p>
                  </div>
                  <InputSelect
                    value={mode}
                    onChange={(value) => setSelectedMode(value as 'read-write' | 'read-only')}
                    options={modeOptions}
                    portal
                    label="Right access"
                    disabled={isUpdating}
                  />
                </>
              )}

              {hasUnsavedChanges && (
                <div className="flex items-center gap-3">
                  <Button size="md" color="brand" onClick={handleSaveMode} loading={isUpdating}>
                    <Icon iconName="check" className="mr-2" />
                    Save changes
                  </Button>
                  <Button size="md" color="neutral" variant="outline" onClick={handleCancelMode} disabled={isUpdating}>
                    Cancel
                  </Button>
                </div>
              )}

              <Callout.Root color="sky" className="mt-4">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>
                    {mode === 'read-only' ? 'Read-Only Mode' : 'Read-Write Mode'}
                  </Callout.TextHeading>
                  <Callout.TextDescription>
                    {mode === 'read-only'
                      ? 'AI Copilot can view your infrastructure configuration but cannot make changes. Perfect for analysis and recommendations.'
                      : 'AI Copilot can view and modify your infrastructure configuration. Use with caution as it has full access to your resources.'}
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            </div>
          </div>
        )}
      </BlockContent>
    </Section>
  )
}

export default SectionAICopilotConfiguration
