import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { useState } from 'react'
import {
  BlockContent,
  Button,
  Callout,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  LoaderSpinner,
  Section,
  useModal,
} from '@qovery/shared/ui'

export interface SectionAICopilotConfigurationProps {
  organization?: Organization
  isLoading?: boolean
  isUpdating?: boolean
  currentMode: 'read-only' | 'read-write'
  onModeChange: (mode: 'read-only' | 'read-write') => void
  onDisable: () => void
}

function getDisableConfirmationModal(closeModal: () => void, onDisable: () => void) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-2 text-neutral-400">Disable AI Copilot</h2>
      <p className="mb-6 text-sm text-neutral-350">
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
  onModeChange,
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
      <div className="mb-8">
        <Heading className="mb-2">AI Copilot Configuration</Heading>
        <p className="text-xs text-neutral-400">Configure your Copilot</p>
      </div>
      <Callout.Root color="purple" className="mb-6">
        <Callout.Icon>
          <Icon iconName="flask" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Beta Feature</Callout.TextHeading>
          <Callout.TextDescription>
            The AI Copilot is currently in beta. This is an experimental feature and functionality may change. Billing
            terms are not final and will be communicated before any charges apply.
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
      <BlockContent title="Configuration" classNameContent="p-0">
        {isLoading ? (
          <div className="flex justify-center p-5">
            <LoaderSpinner className="w-5" />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="-mx-6 border-b border-neutral-250 px-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center">
                    <Icon iconName="robot" className="mr-2 text-brand-500" />
                    <p className="text-sm font-medium text-neutral-400">AI Copilot for {organization?.name}</p>
                  </div>
                  <p className="text-xs text-neutral-350">AI-powered assistance is currently active</p>
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

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Access Mode</label>
                <p className="text-xs text-neutral-350">
                  Choose the level of access the AI Copilot will have on your organization
                </p>
              </div>

              <InputSelect
                value={mode}
                onChange={(value) => setSelectedMode(value as 'read-write' | 'read-only')}
                options={modeOptions}
                portal
                label="Right access"
                disabled={isUpdating || !hasReadWriteAccess}
              />

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
                  <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
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
