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
        className={`flex min-h-[104px] flex-col gap-2 rounded border p-4 text-left transition ${
          selectedModel === 'Claude'
            ? 'border-brand-strong bg-surface-brand-subtle'
            : 'border-neutral bg-surface-neutral-subtle hover:bg-surface-neutral-componentHover'
        }`}
        onClick={() => form.setValue('aiModel', 'Claude', { shouldDirty: true })}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          Claude
        </span>
        <span className="text-xs text-neutral-subtle">Anthropic model used by the workflow agent.</span>
      </button>
      <button
        type="button"
        className="flex min-h-[104px] cursor-not-allowed flex-col gap-2 rounded border border-neutral bg-surface-neutral-subtle p-4 text-left opacity-60"
        disabled
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <Icon name={IconEnum.AWS_GRAY} className="h-5 w-5" />
          Bedrock
        </span>
        <span className="text-xs text-neutral-subtle">Coming later.</span>
      </button>
    </div>
  )
}
