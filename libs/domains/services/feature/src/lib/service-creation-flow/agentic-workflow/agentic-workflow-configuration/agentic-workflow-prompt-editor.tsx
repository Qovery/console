import { type ChangeEvent, forwardRef, useImperativeHandle, useRef } from 'react'
import { TextAreaVariableSuggestion } from '@qovery/domains/variables/feature'
import { Icon, type PromptEditorHandle, Tooltip } from '@qovery/shared/ui'

export interface AgenticWorkflowPromptEditorHandle {
  focusName: () => void
  focusPrompt: () => void
}

export interface AgenticWorkflowPromptEditorProps {
  environmentId: string
  name: string
  nameError?: string
  onNameChange: (value: string) => void
  onPromptChange: (value: string) => void
  prompt: string
  promptError?: string
  variableKeys: string[]
}

export const AgenticWorkflowPromptEditor = forwardRef<
  AgenticWorkflowPromptEditorHandle,
  AgenticWorkflowPromptEditorProps
>(function AgenticWorkflowPromptEditor(
  { environmentId, name, nameError, onNameChange, onPromptChange, prompt, promptError, variableKeys },
  ref
) {
  const nameRef = useRef<HTMLInputElement>(null)
  const promptRef = useRef<PromptEditorHandle>(null)

  useImperativeHandle(ref, () => ({
    focusName: () => nameRef.current?.focus(),
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
      <div>
        <label className="sr-only" htmlFor="agent-task-name">
          Name
        </label>
        <input
          ref={nameRef}
          id="agent-task-name"
          name="name"
          value={name}
          placeholder="New agent task"
          className="w-full bg-transparent text-2xl font-medium text-neutral outline-none placeholder:text-neutral-subtle focus-visible:outline focus-visible:outline-1 focus-visible:outline-neutral-component"
          onChange={(event: ChangeEvent<HTMLInputElement>) => onNameChange(event.currentTarget.value)}
        />
        {nameError ? <p className="mt-1 text-xs font-medium text-negative">{nameError}</p> : null}
      </div>
      <TextAreaVariableSuggestion
        ref={promptRef}
        environmentId={environmentId}
        name="agent-prompt"
        label="Instructions"
        hideLabel
        value={prompt}
        error={promptError}
        className="mt-3 [&_.cm-content]:min-h-80"
        editorClassName="rounded-none border-0 bg-transparent focus-within:!border-0 focus-within:!outline focus-within:!outline-1 focus-within:!outline-neutral-component [&_.cm-content]:px-0 [&_.cm-content]:pt-0 [&_.cm-line]:px-0"
        placeholder="Describe the agent task behavior."
        showVariablePicker={false}
        variableKeys={variableKeys}
        onChange={onPromptChange}
      />
    </div>
  )
})
