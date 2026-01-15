import {
  type Monaco,
  DiffEditor as MonacoDiffEditor,
  type DiffEditorProps as MonacoDiffEditorProps,
} from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useRef } from 'react'
import LoaderSpinner from '../loader-spinner/loader-spinner'
import './code-diff-editor.scss'

export interface DiffStats {
  additions: number
  deletions: number
}

export interface CodeDiffEditorProps extends Omit<MonacoDiffEditorProps, 'original' | 'modified'> {
  original: string
  modified: string
  hideUnchangedRegions?: boolean
  onDiffStatsChange?: (stats: DiffStats) => void
}

export function CodeDiffEditor({
  original,
  modified,
  hideUnchangedRegions = false,
  onDiffStatsChange,
  ...props
}: CodeDiffEditorProps) {
  const editorRef = useRef<editor.IStandaloneDiffEditor | null>(null)

  const computeDiffStats = () => {
    if (!editorRef.current) return

    const lineChanges = editorRef.current.getLineChanges()
    if (!lineChanges) return

    let additions = 0
    let deletions = 0

    lineChanges.forEach((change) => {
      // change.modifiedEndLineNumber - change.modifiedStartLineNumber gives the number of added lines
      // change.originalEndLineNumber - change.originalStartLineNumber gives the number of removed lines
      const addedLines = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1
      const removedLines = change.originalEndLineNumber - change.originalStartLineNumber + 1

      // A change with 0 original lines means pure addition
      if (change.originalEndLineNumber === 0) {
        additions += addedLines
      }
      // A change with 0 modified lines means pure deletion
      else if (change.modifiedEndLineNumber === 0) {
        deletions += removedLines
      }
      // Otherwise it's a modification (both addition and deletion)
      else {
        additions += addedLines
        deletions += removedLines
      }
    })

    onDiffStatsChange?.({ additions, deletions })
  }

  const handleEditorDidMount = (editor: editor.IStandaloneDiffEditor, monaco: Monaco) => {
    editorRef.current = editor

    // Define custom theme for diff editor
    monaco.editor.defineTheme('customDiffTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'diffEditor.removedTextBackground': '#ffcdc240',
        'diffEditor.removedLineBackground': '#feebe740',
        'diffEditor.insertedTextBackground': '#c4e8d13f',
        'diffEditor.insertedLineBackground': '#e6f6eb7f',
      },
    })

    // Apply the custom theme
    monaco.editor.setTheme('customDiffTheme')

    // Listen to diff updates and compute stats when ready
    editor.onDidUpdateDiff(() => {
      computeDiffStats()
    })
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
        overviewRulerLanes: 0,
        renderLineHighlight: 'none',
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
          indentation: false, // To remove automatic generated JSON indentation "guides"
        },
        hideUnchangedRegions: {
          enabled: false,
        },
      }}
      {...props}
    />
  )
}
