import { type FormEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Button, Icon, InputTextArea, type InputTextAreaProps } from '@qovery/shared/ui'
import DropdownVariable from '../dropdown-variable/dropdown-variable'

export interface TextAreaVariableSuggestionProps extends Omit<InputTextAreaProps, 'onChange'> {
  environmentId: string
  onChange: (value: string) => void
  variableKeys?: string[]
}

export const TextAreaVariableSuggestion = forwardRef<HTMLTextAreaElement, TextAreaVariableSuggestionProps>(
  function TextAreaVariableSuggestion({ environmentId, onChange, value = '', variableKeys, ...inputProps }, ref) {
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const currentValue = value ?? ''
    const selectionRef = useRef({ start: 0, end: 0 })
    const [open, setOpen] = useState(false)

    useImperativeHandle(ref, () => inputRef.current as HTMLTextAreaElement)

    const rememberSelection = () => {
      const input = inputRef.current
      if (!input) return

      selectionRef.current = {
        start: input.selectionStart ?? currentValue.length,
        end: input.selectionEnd ?? currentValue.length,
      }
    }

    const handleChange = (event: FormEvent<HTMLTextAreaElement>) => {
      const nextValue = event.currentTarget.value
      const cursor = event.currentTarget.selectionStart ?? nextValue.length
      selectionRef.current = { start: cursor, end: event.currentTarget.selectionEnd ?? cursor }
      onChange(nextValue)

      if (nextValue.slice(Math.max(0, cursor - 2), cursor) === '{{') {
        setOpen(true)
      }
    }

    const handleInsertVariable = (variableKey: string) => {
      const { start, end } = selectionRef.current
      const hasOpeningBraces = currentValue.slice(Math.max(0, start - 2), start) === '{{'
      const insertionStart = hasOpeningBraces ? start - 2 : start
      const nextValue = `${currentValue.slice(0, insertionStart)}{{${variableKey}}}${currentValue.slice(end)}`
      const nextCursor = insertionStart + variableKey.length + 4

      onChange(nextValue)
      setOpen(false)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(nextCursor, nextCursor)
        selectionRef.current = { start: nextCursor, end: nextCursor }
      })
    }

    return (
      <div className="relative">
        <InputTextArea
          ref={inputRef}
          {...inputProps}
          value={currentValue}
          onChange={handleChange}
          className={inputProps.className}
        />
        <DropdownVariable
          environmentId={environmentId}
          variableKeys={variableKeys}
          open={open}
          onOpenChange={(nextOpen) => {
            rememberSelection()
            setOpen(nextOpen)
          }}
          onChange={handleInsertVariable}
        >
          <Button
            aria-label="Insert environment variable"
            size="md"
            type="button"
            color="neutral"
            variant="surface"
            iconOnly
            className="absolute right-2 top-2 h-8 w-8 justify-center"
            onPointerDown={rememberSelection}
          >
            <Icon className="text-sm" iconName="wand-magic-sparkles" />
          </Button>
        </DropdownVariable>
      </div>
    )
  }
)
