import {
  Editor as CodeEditorMonaco,
  type EditorProps as CodeEditorMonacoProps,
  type Monaco,
} from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import LoaderSpinner from '../loader-spinner/loader-spinner'
import './code-editor.scss'

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
        fontSize: 10.4,
        lineHeight: 19,
        readOnly,
        ...options,
      }}
      {...props}
    />
  )
}

export default CodeEditor
