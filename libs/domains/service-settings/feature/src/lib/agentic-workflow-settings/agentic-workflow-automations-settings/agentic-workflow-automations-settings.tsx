import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { AutomationSheet } from '@qovery/domains/services/feature'
import { Button, Icon } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

export function AgenticWorkflowAutomationsSettings({
  form,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
  const [open, setOpen] = useState(false)
  const automation = form.watch('automation')
  const schedule = automation.triggers.find((trigger) => trigger.type === 'schedule')

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Automation"
        description="Choose a webhook or schedule trigger and configure output webhooks."
      >
        <div className="flex items-center justify-between rounded-lg border border-neutral bg-surface-neutral p-4">
          <div>
            <p className="text-sm font-medium text-neutral">{schedule ? 'Schedule' : 'Webhook'}</p>
            <p className="text-xs text-neutral-subtle">
              {automation.outputs.length} output{automation.outputs.length === 1 ? '' : 's'} configured
            </p>
          </div>
          <Button type="button" variant="outline" color="neutral" onClick={() => setOpen(true)}>
            <Icon iconName="gear" />
            Configure
          </Button>
        </div>
      </AgenticWorkflowSettingsCard>
      {open ? (
        <AutomationSheet
          allowEmptyOutputUrl
          automation={automation}
          onClose={() => setOpen(false)}
          onSave={(value) => form.setValue('automation', value, { shouldDirty: true })}
        />
      ) : null}
    </>
  )
}
