import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { Icon } from '@qovery/shared/ui'

export interface AgenticWorkflowExecutionModeSelectorProps {
  onChange: (mode: AgenticWorkflowExecutionMode) => void
  value: AgenticWorkflowExecutionMode
}

export function AgenticWorkflowExecutionModeSelector({ onChange, value }: AgenticWorkflowExecutionModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
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
          aria-pressed={value === mode}
          className={`rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 ${value === mode ? 'border-brand bg-surface-brand-subtle hover:border-brand-strong' : 'border-neutral bg-surface-neutral hover:border-neutral-component hover:bg-surface-neutral-subtle'}`}
          onClick={() => onChange(mode)}
        >
          <span className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-neutral bg-surface-neutral-subtle text-neutral-subtle"
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
  )
}
