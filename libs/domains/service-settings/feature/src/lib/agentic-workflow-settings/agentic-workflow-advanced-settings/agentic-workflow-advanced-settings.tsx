import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Button, CodeEditor, Heading, Icon, Modal, Section } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

function jsonError(value: string) {
  if (!value.trim()) return undefined

  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

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
  const error = language === 'json' ? jsonError(draft) : undefined

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {title}
        </Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className={`overflow-hidden rounded-md border ${error ? 'border-negative' : 'border-neutral'}`}>
        <CodeEditor
          height="320px"
          language={language}
          value={draft}
          onChange={(nextValue) => setDraft(nextValue ?? '')}
          options={{ scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>
      {error ? <p className="text-xs font-medium text-negative">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={Boolean(error)}
          onClick={() => {
            onSave(draft)
            setOpen(false)
          }}
        >
          Save
        </Button>
      </div>
    </Section>
  )
}

export function AgenticWorkflowAdvancedSettings({ form }: { form: UseFormReturn<AgenticWorkflowSettingsFormValues> }) {
  const [codeModal, setCodeModal] = useState<'mcp' | 'docker' | null>(null)
  const mcp = form.watch('mcp')
  const dockerFragment = form.watch('dockerFragment')

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Runtime customization"
        description="Configure optional runtime customization."
      >
        {(
          [
            ['docker', 'Dockerfile fragment', dockerFragment],
            ['mcp', 'Advanced MCP configuration', mcp],
          ] as const
        ).map(([kind, label, value]) => (
          <div key={kind} className="flex items-center gap-3 rounded-lg border border-neutral bg-surface-neutral p-3">
            <Icon iconName="file-lines" iconStyle="regular" className="text-neutral-subtle" />
            <span className="min-w-0 flex-1 text-sm text-neutral">{label}</span>
            <Button type="button" variant="outline" color="neutral" size="xs" onClick={() => setCodeModal(kind)}>
              <Icon iconName={value ? 'pen' : 'plus'} iconStyle="regular" />
              {value ? 'Edit' : 'Add'}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="xs"
                iconOnly
                aria-label={`Delete ${label}`}
                onClick={() => form.setValue(kind === 'mcp' ? 'mcp' : 'dockerFragment', '', { shouldDirty: true })}
              >
                <Icon iconName="trash-can" iconStyle="regular" />
              </Button>
            ) : null}
          </div>
        ))}
      </AgenticWorkflowSettingsCard>
      {codeModal ? (
        <Modal externalOpen setExternalOpen={(open) => !open && setCodeModal(null)} width={720}>
          <CodeConfigurationModal
            title={codeModal === 'mcp' ? 'Configure MCP JSON' : 'Configure Dockerfile fragment'}
            description={
              codeModal === 'mcp'
                ? 'Configure additional MCP servers with JSON.'
                : 'Add setup commands that run before the agent starts.'
            }
            language={codeModal === 'mcp' ? 'json' : 'dockerfile'}
            value={codeModal === 'mcp' ? mcp : dockerFragment}
            setOpen={(open) => !open && setCodeModal(null)}
            onSave={(value) =>
              form.setValue(codeModal === 'mcp' ? 'mcp' : 'dockerFragment', value, { shouldDirty: true })
            }
          />
        </Modal>
      ) : null}
    </>
  )
}
