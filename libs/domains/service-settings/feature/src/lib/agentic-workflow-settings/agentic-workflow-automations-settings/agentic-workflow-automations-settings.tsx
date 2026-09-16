import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { AutomationSheet } from '@qovery/domains/services/feature'
import { Button, Icon } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

export function AgenticWorkflowAutomationsSettings({
  form,
  section,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
  section: 'triggers' | 'outputs'
}) {
  const [open, setOpen] = useState(false)
  const automation = form.watch('automation')
  const schedule = automation.triggers.find((trigger) => trigger.type === 'schedule')
  const isOutputs = section === 'outputs'

  return (
    <>
      <AgenticWorkflowSettingsCard
        title={isOutputs ? 'Output webhooks' : 'Triggers'}
        description={
          isOutputs ? 'Send the agent task result to one or more webhooks.' : 'Choose how the agent task is triggered.'
        }
      >
        <div className="flex items-center justify-between rounded-lg border border-neutral bg-surface-neutral p-4">
          <div>
            <p className="text-sm font-medium text-neutral">
              {isOutputs
                ? `${automation.outputs.length} output${automation.outputs.length === 1 ? '' : 's'} configured`
                : schedule
                  ? 'Schedule'
                  : 'Webhook'}
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
          section={section}
          onClose={() => setOpen(false)}
          onSave={(value) => form.setValue('automation', value, { shouldDirty: true })}
        />
      ) : null}
    </>
  )
}
