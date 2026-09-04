import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Button, CodeEditor, Heading, Icon, Modal, Section } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

function CodeConfigurationModal({
  description,
  language,
  onSave,
  setOpen,
  title,
  value,
}: {
  description: string
  language: string
  onSave: (value: string) => void
  setOpen: (open: boolean) => void
  title: string
  value: string
}) {
  const [draft, setDraft] = useState(value)
  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {title}
        </Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className="overflow-hidden rounded-md border border-neutral">
        <CodeEditor
          height="320px"
          language={language}
          value={draft}
          onChange={(nextValue) => setDraft(nextValue ?? '')}
          options={{ scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            onSave(draft)
            setOpen(false)
          }}
        >
          Apply changes
        </Button>
      </div>
    </Section>
  )
}

export function AgenticWorkflowAdvancedSettings({ form }: { form: UseFormReturn<AgenticWorkflowSettingsFormValues> }) {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const dockerFragment = form.watch('dockerFragment')

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Runtime customization"
        description="Configure optional runtime customization."
      >
        <div className="flex items-center gap-3 rounded-lg border border-neutral bg-surface-neutral p-3">
          <Icon iconName="file-lines" iconStyle="regular" className="text-neutral-subtle" />
          <span className="min-w-0 flex-1 text-sm text-neutral">Dockerfile fragment</span>
          <Button type="button" variant="outline" color="neutral" size="xs" onClick={() => setCodeModalOpen(true)}>
            <Icon iconName={dockerFragment ? 'pen' : 'plus'} iconStyle="regular" />
            {dockerFragment ? 'Edit' : 'Add'}
          </Button>
          {dockerFragment ? (
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="xs"
              iconOnly
              aria-label="Delete Dockerfile fragment"
              onClick={() => form.setValue('dockerFragment', '', { shouldDirty: true })}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          ) : null}
        </div>
      </AgenticWorkflowSettingsCard>
      {codeModalOpen ? (
        <Modal externalOpen setExternalOpen={setCodeModalOpen} width={720}>
          <CodeConfigurationModal
            title="Configure Dockerfile fragment"
            description="Add setup commands that run before the agent starts."
            language="dockerfile"
            value={dockerFragment}
            setOpen={setCodeModalOpen}
            onSave={(value) => form.setValue('dockerFragment', value, { shouldDirty: true })}
          />
        </Modal>
      ) : null}
    </>
  )
}
