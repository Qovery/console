import { AgenticWorkflowModelType } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { Icon } from '@qovery/shared/ui'
import { useAgenticWorkflowCreateContext } from '../agentic-workflow-context'

export function AIModelCards() {
  const { form } = useAgenticWorkflowCreateContext()
  const selectedModel = form.watch('aiModel')

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className={`flex min-h-20 flex-col gap-1.5 rounded border p-3 text-left transition ${
          selectedModel === AgenticWorkflowModelType.CLAUDE
            ? 'border-brand-strong bg-surface-brand-subtle'
            : 'border-neutral bg-surface-neutral-subtle hover:bg-surface-neutral-componentHover'
        }`}
        onClick={() => form.setValue('aiModel', AgenticWorkflowModelType.CLAUDE, { shouldDirty: true })}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-4 w-4" />
          Anthropic
        </span>
        <span className="text-xs text-neutral-subtle">Claude models used by the agent task.</span>
      </button>
      <button
        type="button"
        className="flex min-h-20 cursor-not-allowed flex-col gap-1.5 rounded border border-neutral bg-surface-neutral-subtle p-3 text-left opacity-60"
        disabled
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <Icon name={IconEnum.AWS_GRAY} className="h-4 w-4" />
          Bedrock
        </span>
        <span className="text-xs text-neutral-subtle">Coming later.</span>
      </button>
    </div>
  )
}
