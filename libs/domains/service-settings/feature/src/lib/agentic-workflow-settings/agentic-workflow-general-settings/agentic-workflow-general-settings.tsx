import { Controller, type UseFormReturn } from 'react-hook-form'
import { AgenticWorkflowExecutionModeSelector } from '@qovery/domains/services/feature'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

const RESOURCE_FIELDS = [
  { name: 'cpu', label: 'CPU (mCPU)' },
  { name: 'ram', label: 'Memory (MiB)' },
  { name: 'gpu', label: 'GPU' },
  { name: 'storage', label: 'Storage (GiB)' },
] as const satisfies ReadonlyArray<{
  name: keyof Pick<AgenticWorkflowSettingsFormValues, 'cpu' | 'ram' | 'gpu' | 'storage'>
  label: string
}>

export function AgenticWorkflowGeneralSettings({ form }: { form: UseFormReturn<AgenticWorkflowSettingsFormValues> }) {
  const executionMode = form.watch('executionMode')

  return (
    <>
      <AgenticWorkflowSettingsCard title="Identity">
        <Controller name="name" control={form.control} render={({ field }) => <InputText {...field} label="Name" />} />
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => <InputTextArea {...field} label="Description" />}
        />
        <Controller
          name="enabled"
          control={form.control}
          render={({ field }) => (
            <InputToggle
              small
              align="top"
              value={field.value}
              title="Enable agent task"
              description="Allow this agent task to listen for and process incoming requests."
              onChange={field.onChange}
            />
          )}
        />
      </AgenticWorkflowSettingsCard>
      <AgenticWorkflowSettingsCard
        title="Execution mode"
        description="Choose how each agent task execution is isolated."
      >
        <AgenticWorkflowExecutionModeSelector
          value={executionMode}
          onChange={(mode) => form.setValue('executionMode', mode, { shouldDirty: true })}
        />
      </AgenticWorkflowSettingsCard>
      <AgenticWorkflowSettingsCard
        title="Resources"
        description="Configure the compute resources allocated to the agent task."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {RESOURCE_FIELDS.map(({ name, label }) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => <InputText {...field} type="number" label={label} />}
            />
          ))}
        </div>
      </AgenticWorkflowSettingsCard>
    </>
  )
}
