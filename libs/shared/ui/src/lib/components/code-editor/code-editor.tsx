import { Editor as CodeEditorMonaco, type EditorProps as CodeEditorMonacoProps } from '@monaco-editor/react'

export interface CodeEditorProps extends CodeEditorMonacoProps {
  readOnly?: boolean
}

export function CodeEditor(props: CodeEditorProps) {
  return (
    <CodeEditorMonaco
      theme="Chrome DevTools"
      options={{
        minimap: { enabled: false },
        readOnly: props.readOnly,
      }}
      {...props}
    />
  )
}

export default CodeEditor
