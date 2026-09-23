import { Controller, type UseFormReturn } from 'react-hook-form'
import {
  AGENTIC_WORKFLOW_MIN_CPU_MILLI,
  AGENTIC_WORKFLOW_MIN_RAM_MIB,
  AgenticWorkflowExecutionModeSelector,
} from '@qovery/domains/services/feature'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

const RESOURCE_FIELDS = [
  { name: 'cpu', label: 'CPU (mCPU)', min: AGENTIC_WORKFLOW_MIN_CPU_MILLI },
  { name: 'ram', label: 'Memory (MiB)', min: AGENTIC_WORKFLOW_MIN_RAM_MIB },
  { name: 'gpu', label: 'GPU' },
  { name: 'storage', label: 'Storage (GiB)' },
] as const satisfies ReadonlyArray<{
  name: keyof Pick<AgenticWorkflowSettingsFormValues, 'cpu' | 'ram' | 'gpu' | 'storage'>
  label: string
  min?: number
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
          {RESOURCE_FIELDS.map(({ name, label, ...rules }) => {
            const minimum = 'min' in rules ? rules.min : undefined
            const minimumError = minimum === undefined ? undefined : `${label} must be at least ${minimum}.`
            const validationRules =
              minimum === undefined
                ? undefined
                : {
                    required: `${label} must be at least ${minimum}.`,
                    min: { value: minimum, message: `${label} must be at least ${minimum}.` },
                  }

            return (
              <Controller
                key={name}
                name={name}
                control={form.control}
                rules={validationRules}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    {...field}
                    type="number"
                    label={label}
                    error={
                      error?.message ??
                      (minimum !== undefined && Number(field.value) < minimum ? minimumError : undefined)
                    }
                  />
                )}
              />
            )
          })}
        </div>
      </AgenticWorkflowSettingsCard>
    </>
  )
}
