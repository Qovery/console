import { forwardRef, useImperativeHandle, useRef } from 'react'
import { TextAreaVariableSuggestion } from '@qovery/domains/variables/feature'
import { Icon, type PromptEditorHandle, Tooltip } from '@qovery/shared/ui'

export interface AgenticWorkflowPromptEditorHandle {
  focusPrompt: () => void
}

export interface AgenticWorkflowPromptEditorProps {
  environmentId: string
  onPromptChange: (value: string) => void
  prompt: string
  promptError?: string
  variableKeys: string[]
}

export const AgenticWorkflowPromptEditor = forwardRef<
  AgenticWorkflowPromptEditorHandle,
  AgenticWorkflowPromptEditorProps
>(function AgenticWorkflowPromptEditor({ environmentId, onPromptChange, prompt, promptError, variableKeys }, ref) {
  const promptRef = useRef<PromptEditorHandle>(null)

  useImperativeHandle(ref, () => ({
    focusPrompt: () => promptRef.current?.focus(),
  }))

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-subtle">
        <span>Instructions</span>
        <Tooltip
          content={
            <span>
              Type <code className="font-mono">{'{{'}</code> to select an environment variable.
            </span>
          }
        >
          <button
            type="button"
            aria-label="Environment variable help"
            className="flex h-4 w-4 items-center justify-center hover:text-neutral"
          >
            <Icon iconName="circle-info" className="text-xs" />
          </button>
        </Tooltip>
      </div>
      <TextAreaVariableSuggestion
        ref={promptRef}
        environmentId={environmentId}
        name="agent-prompt"
        label="Instructions"
        hideLabel
        value={prompt}
        error={promptError}
        className="[&_.cm-content]:min-h-80"
        editorClassName="rounded-none border-0 bg-transparent focus-within:!border-0 focus-within:!outline-none [&_.cm-content]:px-0 [&_.cm-content]:pt-0 [&_.cm-line]:px-0"
        placeholder="Type your instructions here…"
        showVariablePicker={false}
        variableKeys={variableKeys}
        onChange={onPromptChange}
      />
    </div>
  )
})
