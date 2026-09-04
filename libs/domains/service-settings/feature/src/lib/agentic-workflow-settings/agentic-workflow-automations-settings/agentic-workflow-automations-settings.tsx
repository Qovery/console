import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { AutomationSheet } from '@qovery/domains/services/feature'
import { Button, Icon } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

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
        description="The webhook trigger is always available. Add a schedule or configure output webhooks."
      >
        <div className="flex items-center justify-between rounded-lg border border-neutral bg-surface-neutral p-4">
          <div>
            <p className="text-sm font-medium text-neutral">Webhook{schedule ? ' + schedule' : ''}</p>
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
          lockWebhookTrigger
          onClose={() => setOpen(false)}
          onSave={(value) => form.setValue('automation', value, { shouldDirty: true })}
        />
      ) : null}
    </>
  )
}
