import { type Monaco } from '@monaco-editor/react'
import { type editor } from 'monaco-editor'
import { type ComponentProps } from 'react'
import { CodeEditor } from '@qovery/shared/ui'
import { useVariables } from '../hooks/use-variables/use-variables'

interface CodeEditorVariablesProps extends ComponentProps<typeof CodeEditor> {
  environmentId: string
}
export function CodeEditorVariables({ environmentId, language = 'json', options, ...props }: CodeEditorVariablesProps) {
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
  )
}

export default CodeEditorVariables
