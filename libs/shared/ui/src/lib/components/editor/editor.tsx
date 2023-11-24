import { Editor as EditMonaco, type EditorProps as EditorMonacoProps } from '@monaco-editor/react'

export interface EditorProps extends EditorMonacoProps {}

export function Editor(props: EditorProps) {
  return (
    <EditMonaco
      theme="Chrome DevTools"
      options={{
        minimap: { enabled: false },
      }}
      {...props}
    />
  )
}

export default Editor
