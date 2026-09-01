import { forwardRef, useRef, useState } from 'react'
import { Button, Icon, PromptEditor, type PromptEditorHandle, type PromptEditorProps } from '@qovery/shared/ui'
import DropdownVariable from '../dropdown-variable/dropdown-variable'
import { useVariables } from '../hooks/use-variables/use-variables'

export interface TextAreaVariableSuggestionProps
  extends Omit<PromptEditorProps, 'actions' | 'onChange' | 'suggestions'> {
  environmentId: string
  onChange: (value: string) => void
  showVariablePicker?: boolean
  variableKeys?: string[]
}

export const TextAreaVariableSuggestion = forwardRef<PromptEditorHandle, TextAreaVariableSuggestionProps>(
  function TextAreaVariableSuggestion(
    { environmentId, onChange, showVariablePicker = true, value, variableKeys = [], ...inputProps },
    ref
  ) {
    const editorRef = useRef<PromptEditorHandle | null>(null)
    const replaceOpeningBracesRef = useRef(false)
    const [open, setOpen] = useState(false)
    const { data: environmentVariables = [] } = useVariables({ parentId: environmentId, scope: 'ENVIRONMENT' })
    const autocompleteKeys = Array.from(new Set([...variableKeys, ...environmentVariables.map(({ key }) => key)]))

    const handleChange = (nextValue: string, { cursor }: { cursor: number }) => {
      onChange(nextValue)

      if (nextValue.slice(Math.max(0, cursor - 2), cursor) === '{{') {
        replaceOpeningBracesRef.current = true
      }
    }

    const handleInsertVariable = (variableKey: string) => {
      editorRef.current?.insertText(`{{${variableKey}}}`, {
        deleteBefore: replaceOpeningBracesRef.current ? 2 : 0,
      })
      replaceOpeningBracesRef.current = false
      setOpen(false)
    }

    return (
      <PromptEditor
        {...inputProps}
        ref={(editor) => {
          editorRef.current = editor
          if (typeof ref === 'function') ref(editor)
          else if (ref) ref.current = editor
        }}
        value={value}
        suggestions={autocompleteKeys.map((key) => ({ label: key }))}
        onChange={handleChange}
        actions={
          showVariablePicker ? (
            <DropdownVariable
              environmentId={environmentId}
              variableKeys={autocompleteKeys}
              open={open}
              onOpenChange={setOpen}
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
                onPointerDown={() => {
                  replaceOpeningBracesRef.current = false
                }}
              >
                <Icon className="text-sm" iconName="wand-magic-sparkles" />
              </Button>
            </DropdownVariable>
          ) : null
        }
      />
    )
  }
)
