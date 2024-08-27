import { type Monaco } from '@monaco-editor/react'
import { type editor } from 'monaco-editor'
import { type ComponentProps } from 'react'
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

  const handleEditorDidMount = async (_: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const { data: variables = [] } = await refetchVariables()

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: function (_, position) {
        const suggestions = variables.map((variable) => ({
          label: variable.key,
          detail: variable.description,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: `{{${variable.key}}}`,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column - 2,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }))
        return { suggestions }
      },
    })
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
      <DropdownVariable environmentId={environmentId} onChange={(e) => console.log('onChange', e)}>
        <Button
          data-testid="button-variable"
          size="md"
          type="button"
          color="neutral"
          variant="surface"
          className="absolute right-3 top-3 px-2.5"
        >
          <Icon className="text-sm" iconName="wand-magic-sparkles" />
        </Button>
      </DropdownVariable>
    </div>
  )
}

export default CodeEditorVariable
