import { DiffEditor as MonacoDiffEditor, type DiffEditorProps as MonacoDiffEditorProps } from '@monaco-editor/react'
import LoaderSpinner from '../loader-spinner/loader-spinner'

export interface CodeDiffEditorProps extends Omit<MonacoDiffEditorProps, 'original' | 'modified'> {
  original: string
  modified: string
  hideUnchangedRegions?: boolean
}

export function CodeDiffEditor({
  original,
  modified,
  hideUnchangedRegions = false,
  ...props
}: CodeDiffEditorProps) {
  return (
    <MonacoDiffEditor
      original={original}
      modified={modified}
      theme="vs"
      loading={<LoaderSpinner />}
      // Added keepCurrentModifiedModel and keepCurrentOriginalModel to prevent "TextModel got disposed before DiffEditorWidget model got reset" issue
      // https://github.com/suren-atoyan/monaco-react/issues/647#issuecomment-2897027817
      keepCurrentModifiedModel={true}
      keepCurrentOriginalModel={true}
      options={{
        renderSideBySide: true,
        readOnly: true,
        originalEditable: false,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ignoreTrimWhitespace: true,
        renderIndicators: true,
        hideUnchangedRegions: {
          enabled: hideUnchangedRegions,
          contextLineCount: 0,
          minimumLineCount: 0,
        },
      }}
      {...props}
    />
  )
}

