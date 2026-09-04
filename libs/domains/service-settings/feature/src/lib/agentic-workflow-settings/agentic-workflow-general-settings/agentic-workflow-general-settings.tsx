import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

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
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [AgenticWorkflowExecutionMode.IN_PLACE, 'In place', 'Concurrent runs share the current environment.'],
            [
              AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
              'Clone environment',
              'Create an isolated temporary environment for every run.',
            ],
          ].map(([mode, label, description]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={executionMode === mode}
              className={`rounded-lg border p-4 text-left focus-visible:outline-2 ${executionMode === mode ? 'border-brand bg-surface-brand-subtle' : 'border-neutral bg-surface-neutral'}`}
              onClick={() =>
                form.setValue('executionMode', mode as AgenticWorkflowExecutionMode, { shouldDirty: true })
              }
            >
              <span className="block text-sm font-medium text-neutral">{label}</span>
              <span className="mt-1 block text-xs text-neutral-subtle">{description}</span>
            </button>
          ))}
        </div>
      </AgenticWorkflowSettingsCard>
      <AgenticWorkflowSettingsCard
        title="Resources"
        description="Configure the compute resources allocated to the agent task."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(['cpu', 'ram', 'gpu', 'storage'] as const).map((name) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <InputText
                  {...field}
                  type="number"
                  label={{ cpu: 'CPU (mCPU)', ram: 'Memory (MiB)', gpu: 'GPU', storage: 'Storage (GiB)' }[name]}
                />
              )}
            />
          ))}
        </div>
      </AgenticWorkflowSettingsCard>
    </>
  )
}
