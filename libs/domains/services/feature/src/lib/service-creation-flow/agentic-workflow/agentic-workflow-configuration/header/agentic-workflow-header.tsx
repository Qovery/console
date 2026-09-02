import { type ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Icon } from '@qovery/shared/ui'

export interface AgenticWorkflowHeaderHandle {
  focusName: () => void
}

export interface AgenticWorkflowHeaderProps {
  name: string
  nameError?: string
  onNameChange: (value: string) => void
}

export const AgenticWorkflowHeader = forwardRef<AgenticWorkflowHeaderHandle, AgenticWorkflowHeaderProps>(
  function AgenticWorkflowHeader({ name, nameError, onNameChange }, ref) {
    const nameRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focusName: () => nameRef.current?.focus(),
    }))

    // Focus the name on mount so it is clear the title is editable.
    useEffect(() => {
      nameRef.current?.focus()
    }, [])

    return (
      <div className="flex flex-col items-start gap-3">
        <Icon name={IconEnum.AGENTIC_WORKFLOW} width={48} height={48} className="shrink-0" />
        <div className="w-full">
          <label className="sr-only" htmlFor="agent-task-name">
            Name
          </label>
          <input
            ref={nameRef}
            id="agent-task-name"
            name="name"
            value={name}
            placeholder="New agent task"
            className="w-full max-w-[760px] bg-transparent text-[36px] font-medium leading-[48px] text-neutral outline-none placeholder:text-neutral-subtle"
            onChange={(event: ChangeEvent<HTMLInputElement>) => onNameChange(event.currentTarget.value)}
          />
          {nameError ? <p className="mt-1 text-xs font-medium text-negative">{nameError}</p> : null}
        </div>
      </div>
    )
  }
)
