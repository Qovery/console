import { DiffEditor as MonacoDiffEditor, type DiffEditorProps as MonacoDiffEditorProps } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
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
  const handleEditorDidMount = (editor: editor.IStandaloneDiffEditor, monaco: typeof import('monaco-editor')) => {
    // Define custom theme for diff editor
    monaco.editor.defineTheme('customDiffTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'diffEditor.removedTextBackground': '#ffcdc2',
        'diffEditor.removedLineBackground': '#feebe7',
        'diffEditor.insertedTextBackground': '#c4e8d1',
        'diffEditor.insertedLineBackground': '#e6f6eb',
      },
    })

    // Apply the custom theme
    monaco.editor.setTheme('customDiffTheme')

    // Call user's onMount if provided
    // TODO to remove
    // if (props.onMount) {
    //   props.onMount(editor, monaco)
    // }
  }

  return (
    <MonacoDiffEditor
      original={original}
      modified={modified}
      theme="customDiffTheme"
      loading={<LoaderSpinner />}
      onMount={handleEditorDidMount}
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
        renderIndicators: false, // remove '-' and '+' from diff view
        selectOnLineNumbers: false, // Issue when line can be selected
        renderOverviewRuler: false, // Hide overview because too much space
        guides: {
          indentation: false // To remove automatic generated JSON indentation "guides"
        },
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

