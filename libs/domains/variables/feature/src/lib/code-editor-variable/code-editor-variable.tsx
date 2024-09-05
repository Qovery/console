import { type Monaco } from '@monaco-editor/react'
import { type editor } from 'monaco-editor'
import { type ComponentProps, useRef } from 'react'
import { Button, CodeEditor, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import DropdownVariable from '../dropdown-variable/dropdown-variable'
import { useVariables } from '../hooks/use-variables/use-variables'

interface CodeEditorVariableProps extends ComponentProps<typeof CodeEditor> {
  environmentId: string
}

export function CodeEditorVariable({
  environmentId,
  language = 'json',
  options,
  className,
  ...props
}: CodeEditorVariableProps) {
  const { refetch: refetchVariables } = useVariables({
    parentId: environmentId,
    scope: 'ENVIRONMENT',
  })

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const formatVariableKey = (key: string) => (language === 'yaml' ? `qovery.env.${key}` : `{{${key}}}`)

  const handleEditorDidMount = async (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    const { data: variables = [] } = await refetchVariables()

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: function (_, position) {
        const suggestions = variables.map((variable) => ({
          label: variable.key,
          detail: variable.description,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: formatVariableKey(variable.key),
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }))
        return { suggestions }
      },
    })
  }

  const handleVariableChange = (variableKey: string) => {
    if (editorRef.current) {
      const editor = editorRef.current
      const position = editor.getPosition()
      if (position) {
        editor.executeEdits('', [
          {
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            text: formatVariableKey(variableKey),
          },
        ])
        editor.focus()
      }
    }
  }

  return (
    <div className={twMerge('relative', className)}>
      <CodeEditor
        onMount={handleEditorDidMount}
        language={language}
        options={{
          ...options,
          quickSuggestions: {
            strings: true,
          },
        }}
        {...props}
      />
      <DropdownVariable environmentId={environmentId} onChange={handleVariableChange}>
        <Button size="md" type="button" color="neutral" variant="surface" className="absolute right-4 top-4 px-2.5">
          <Icon className="text-sm" iconName="wand-magic-sparkles" />
        </Button>
      </DropdownVariable>
    </div>
  )
}

export default CodeEditorVariable
