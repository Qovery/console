import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Icon, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
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
            {
              mode: AgenticWorkflowExecutionMode.IN_PLACE,
              label: 'In place',
              description: 'Concurrent runs share the current environment.',
              iconName: 'server' as const,
            },
            {
              mode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
              label: 'Clone environment',
              description: 'Create an isolated temporary environment for every run.',
              iconName: 'clone' as const,
            },
          ].map(({ mode, label, description, iconName }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={executionMode === mode}
              className={`rounded-lg border p-4 text-left focus-visible:outline-2 ${executionMode === mode ? 'border-brand bg-surface-brand-subtle' : 'border-neutral bg-surface-neutral'}`}
              onClick={() =>
                form.setValue('executionMode', mode as AgenticWorkflowExecutionMode, { shouldDirty: true })
              }
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${executionMode === mode ? 'border-brand bg-surface-neutral text-brand' : 'border-neutral bg-surface-neutral-subtle text-neutral-subtle'}`}
                >
                  <Icon iconName={iconName} iconStyle="regular" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-neutral">{label}</span>
                  <span className="mt-1 block text-xs text-neutral-subtle">{description}</span>
                </span>
              </span>
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
