import { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { type ReactNode, useEffect, useRef } from 'react'
import { approxTokens } from '@qovery/domains/skill-presets/data-access'
import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { CodeEditor, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { FindingList } from '../finding-list/finding-list'

export interface MarkdownFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  hint?: ReactNode
  error?: string
  findings?: SkillPresetFinding[]
  minLines?: number
  maxLines?: number
  readOnly?: boolean
  className?: string
}

const LINE_HEIGHT = 19

export function MarkdownField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
  error,
  findings = [],
  minLines = 6,
  maxLines = 18,
  readOnly,
  className,
}: MarkdownFieldProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null)

  const lineCount = Math.max(value.split('\n').length, minLines)
  const height = Math.min(lineCount, maxLines) * LINE_HEIGHT + 16
  const isOverLimit = value.length > maxLength
  const hasFindings = findings.length > 0
  const hintId = `${id}-hint`
  const feedbackId = `${id}-feedback`

  // Monaco lives outside React: findings are pushed to it as markers (hover text) and line highlights.
  useEffect(() => {
    const editorInstance = editorRef.current
    const monaco = monacoRef.current
    const model = editorInstance?.getModel()
    if (!editorInstance || !monaco || !model) return

    const lines = findings.filter(({ line }) => line <= model.getLineCount())
    monaco.editor.setModelMarkers(
      model,
      'skill-preset-findings',
      lines.map(({ line, reason, rule_id }) => ({
        severity: monaco.MarkerSeverity.Error,
        message: `${reason} (${rule_id})`,
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: model.getLineMaxColumn(line),
      }))
    )
    decorationsRef.current?.clear()
    decorationsRef.current = editorInstance.createDecorationsCollection(
      lines.map(({ line }) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'bg-surface-negative-subtle',
          linesDecorationsClassName: 'bg-surface-negative-solid',
        },
      }))
    )
  }, [findings])

  const revealLine = (line: number) => {
    const editorInstance = editorRef.current
    if (!editorInstance) return
    editorInstance.revealLineInCenter(line)
    editorInstance.setPosition({ lineNumber: line, column: 1 })
    editorInstance.focus()
  }

  return (
    <div className={twMerge('flex flex-col gap-1.5', className)} id={id} data-testid={id}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-neutral" id={`${id}-label`}>
          {label}
        </span>
        <span
          className={twMerge('shrink-0 text-xs tabular-nums text-neutral-subtle', isOverLimit && 'text-negative')}
          aria-live="polite"
        >
          {value.length.toLocaleString('en-US')} / {maxLength.toLocaleString('en-US')} characters · ~
          {approxTokens(value).toLocaleString('en-US')} tokens
        </span>
      </div>
      <div
        className={twMerge(
          'overflow-hidden rounded-md border border-neutral bg-surface-neutral focus-within:border-brand-strong',
          (error || hasFindings) && 'border-negative-strong'
        )}
        aria-describedby={[hint ? hintId : null, error || hasFindings ? feedbackId : null].filter(Boolean).join(' ')}
      >
        <CodeEditor
          language="markdown"
          value={value}
          height={`${height}px`}
          readOnly={readOnly}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          onMount={(editorInstance, monaco) => {
            editorRef.current = editorInstance
            monacoRef.current = monaco
          }}
          options={{
            ariaLabel: label,
            wordWrap: 'on',
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            scrollbar: { alwaysConsumeMouseWheel: false },
            stickyScroll: { enabled: false },
            quickSuggestions: false,
          }}
        />
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-neutral-subtle">
          {hint}
        </p>
      )}
      <div id={feedbackId}>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-negative">
            <Icon iconName="circle-exclamation" iconStyle="regular" />
            {error}
          </p>
        )}
        {hasFindings && <FindingList findings={findings} onSelectLine={revealLine} />}
      </div>
    </div>
  )
}
