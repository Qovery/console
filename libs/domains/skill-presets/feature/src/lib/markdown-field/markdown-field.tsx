import { type Monaco } from '@monaco-editor/react'
import clsx from 'clsx'
import { type editor } from 'monaco-editor'
import { type SkillPresetRejectionFinding } from 'qovery-typescript-axios'
import { useEffect, useRef } from 'react'
import { approxTokens } from '@qovery/domains/skill-presets/data-access'
import { CodeEditor, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { FindingList } from '../finding-list/finding-list'
import { findingSourceLabel } from '../utils/skill-preset-findings'

export interface MarkdownFieldProps {
  id: string
  /** The form field path: lets a failed submit find this field, which has no input of that name. */
  name?: string
  label: string
  hideLabel?: boolean
  value: string
  onChange: (value: string) => void
  maxLength: number
  hint?: string
  error?: string
  findings?: SkillPresetRejectionFinding[]
  minLines?: number
  maxLines?: number
  readOnly?: boolean
  className?: string
}

const LINE_HEIGHT = 19

interface MonacoHandles {
  editor: editor.IStandaloneCodeEditor
  monaco: Monaco
  decorations: editor.IEditorDecorationsCollection
}

/** Pushes findings into Monaco: markers carry the reason on hover, decorations highlight the line. */
function applyFindings(
  { editor: editorInstance, monaco, decorations }: MonacoHandles,
  findings: SkillPresetRejectionFinding[]
) {
  const model = editorInstance.getModel()
  if (!model) return
  const lines = findings.filter(({ line }) => line <= model.getLineCount())
  monaco.editor.setModelMarkers(
    model,
    'skill-preset-findings',
    lines.map((finding) => ({
      severity: monaco.MarkerSeverity.Error,
      message: `${findingSourceLabel(finding)}: ${finding.reason} (${finding.rule_id})`,
      startLineNumber: finding.line,
      startColumn: 1,
      endLineNumber: finding.line,
      endColumn: model.getLineMaxColumn(finding.line),
    }))
  )
  decorations.set(
    lines.map(({ line }) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'bg-surface-negative-subtle',
        linesDecorationsClassName: 'bg-surface-negative-solid',
      },
    }))
  )
}

/** Monaco reads keyboard input from its own textarea: that is the element the hint and errors describe. */
function describeTextarea(editorInstance: editor.IStandaloneCodeEditor, describedBy: string, invalid: boolean) {
  const textarea = editorInstance.getDomNode()?.querySelector('textarea')
  if (!textarea) return
  if (describedBy) textarea.setAttribute('aria-describedby', describedBy)
  else textarea.removeAttribute('aria-describedby')
  if (invalid) textarea.setAttribute('aria-invalid', 'true')
  else textarea.removeAttribute('aria-invalid')
}

export function MarkdownField({
  id,
  name,
  label,
  hideLabel = false,
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
  const handlesRef = useRef<MonacoHandles | null>(null)
  const findingsRef = useRef(findings)
  findingsRef.current = findings

  const lineCount = Math.max(value.split('\n').length, minLines)
  const height = Math.min(lineCount, maxLines) * LINE_HEIGHT + 16
  const isOverLimit = value.length > maxLength
  const hasFindings = findings.length > 0
  const isInvalid = Boolean(error) || hasFindings || isOverLimit
  const hintId = `${id}-hint`
  const feedbackId = `${id}-feedback`
  const describedBy = [`${id}-counter`, hint ? hintId : null, error || hasFindings ? feedbackId : null]
    .filter(Boolean)
    .join(' ')
  // A stable key: the parent rebuilds the findings array on every render.
  const findingsKey = findings.map(({ line, rule_id, source }) => `${source}:${line}:${rule_id}`).join(',')

  useEffect(() => {
    if (handlesRef.current) applyFindings(handlesRef.current, findingsRef.current)
  }, [findingsKey])

  useEffect(() => {
    if (handlesRef.current) describeTextarea(handlesRef.current.editor, describedBy, isInvalid)
  }, [describedBy, isInvalid])

  const revealLine = (line: number) => {
    const editorInstance = handlesRef.current?.editor
    if (!editorInstance) return
    editorInstance.revealLineInCenter(line)
    editorInstance.setPosition({ lineNumber: line, column: 1 })
    editorInstance.focus()
  }

  return (
    <div className={twMerge('flex flex-col gap-1.5', className)} id={id} data-testid={id} data-field-name={name}>
      <div className={hideLabel ? 'sr-only' : undefined}>
        <span className={hideLabel ? 'sr-only' : 'text-sm font-medium text-neutral'} id={`${id}-label`}>
          {label}
        </span>
        {/* Announced once, when the limit is crossed, not on every keystroke. */}
        <span className="sr-only" aria-live="polite">
          {isOverLimit ? `${label} is over the ${maxLength.toLocaleString('en-US')} character limit.` : ''}
        </span>
      </div>
      <div
        className={clsx(
          'overflow-hidden rounded-md border bg-surface-neutral focus-within:border-brand-strong',
          error || hasFindings ? 'border-negative-strong' : 'border-neutral'
        )}
      >
        <CodeEditor
          language="markdown"
          value={value}
          height={`${height}px`}
          readOnly={readOnly}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          onMount={(editorInstance, monaco) => {
            handlesRef.current = {
              editor: editorInstance,
              monaco,
              decorations: editorInstance.createDecorationsCollection(),
            }
            // Editors mounted after a rejection (a skill switched to "Add instructions") still show it.
            applyFindings(handlesRef.current, findingsRef.current)
            describeTextarea(editorInstance, describedBy, isInvalid)
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
      <p
        id={`${id}-counter`}
        className={clsx('text-xs tabular-nums', isOverLimit ? 'text-negative' : 'text-neutral-subtle')}
      >
        {value.length.toLocaleString('en-US')} / {maxLength.toLocaleString('en-US')} characters · ~
        {approxTokens(value).toLocaleString('en-US')} tokens
      </p>
      {hint && (
        <p id={hintId} className="text-xs text-neutral-subtle">
          {hint}
        </p>
      )}
      <div id={feedbackId}>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-negative">
            <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
            {error}
          </p>
        )}
        {hasFindings && <FindingList findings={findings} onSelectLine={revealLine} />}
      </div>
    </div>
  )
}
