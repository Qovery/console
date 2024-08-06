import { Editor as CodeEditorMonaco, type EditorProps as CodeEditorMonacoProps } from '@monaco-editor/react'
import LoaderSpinner from '../loader-spinner/loader-spinner'

export interface CodeEditorProps extends CodeEditorMonacoProps {
  readOnly?: boolean
}

export function CodeEditor({ readOnly, options, ...props }: CodeEditorProps) {
  return (
    <CodeEditorMonaco
      theme="Chrome DevTools"
      loading={<LoaderSpinner />}
      options={{
        minimap: { enabled: false },
        readOnly,
        ...options,
      }}
      {...props}
    />
  )
}

export default CodeEditor
