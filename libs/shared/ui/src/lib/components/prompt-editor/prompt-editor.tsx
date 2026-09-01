import { type Completion, type CompletionContext, autocompletion } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView, placeholder as editorPlaceholder, keymap } from '@codemirror/view'
import clsx from 'clsx'
import { type ReactNode, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface PromptEditorSuggestion {
  detail?: string
  label: string
  value?: string
}

export interface PromptEditorHandle {
  focus: () => void
  insertText: (text: string, options?: { deleteBefore?: number }) => void
}

export interface PromptEditorProps {
  actions?: ReactNode
  className?: string
  disabled?: boolean
  editorClassName?: string
  error?: string
  hideLabel?: boolean
  hint?: ReactNode
  label: string
  labelAction?: ReactNode
  name: string
  onChange: (value: string, context: { cursor: number }) => void
  placeholder?: string
  suggestions?: PromptEditorSuggestion[]
  value: string
}

function variableCompletions(getSuggestions: () => PromptEditorSuggestion[]) {
  return (context: CompletionContext) => {
    const token = context.matchBefore(/\{\{[\w.-]*/)
    if (!token) return null

    const options: Completion[] = getSuggestions().map(({ detail, label, value }) => ({
      apply: `${value ?? label}}}`,
      detail,
      label,
      type: 'variable',
    }))

    return { from: token.from + 2, options }
  }
}

export const PromptEditor = forwardRef<PromptEditorHandle, PromptEditorProps>(function PromptEditor(
  {
    actions,
    className,
    disabled,
    editorClassName,
    error,
    hideLabel = false,
    hint,
    label,
    labelAction,
    name,
    onChange,
    placeholder,
    suggestions = [],
    value,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView>()
  const initialValueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const suggestionsRef = useRef(suggestions)
  const describedBy = `${name}-${error ? 'error' : 'hint'}`

  onChangeRef.current = onChange
  suggestionsRef.current = suggestions

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    insertText: (text, options) => {
      const editor = editorRef.current
      if (!editor) return

      const { from, to } = editor.state.selection.main
      const insertionStart = Math.max(0, from - (options?.deleteBefore ?? 0))
      editor.dispatch({
        changes: { from: insertionStart, insert: text, to },
        selection: { anchor: insertionStart + text.length },
      })
      editor.focus()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const editor = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: initialValueRef.current,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          EditorState.readOnly.of(Boolean(disabled)),
          EditorView.editable.of(!disabled),
          EditorView.contentAttributes.of({
            'aria-describedby': describedBy,
            'aria-invalid': String(Boolean(error)),
            'aria-label': label,
            'data-testid': name,
          }),
          EditorView.theme({
            '&': { backgroundColor: 'transparent', color: 'inherit', height: '100%' },
            '&.cm-focused': { outline: 'none' },
            '.cm-content': { caretColor: 'currentColor', fontFamily: 'inherit' },
            '.cm-scroller': { fontFamily: 'inherit', overflow: 'auto' },
            '.cm-tooltip': {
              backgroundColor: 'var(--background-1)',
              border: '1px solid var(--neutral-6)',
              borderRadius: '0.375rem',
              color: 'var(--neutral-12)',
              overflow: 'hidden',
            },
            '.cm-tooltip-autocomplete > ul': { fontFamily: 'inherit', padding: '0.25rem' },
            '.cm-tooltip-autocomplete > ul > li': { borderRadius: '0.25rem', padding: '0.375rem 0.5rem' },
            '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
              backgroundColor: 'var(--brand-3)',
              color: 'var(--brand-12)',
            },
            '.cm-completionIcon-variable': { color: 'var(--brand-11)' },
          }),
          editorPlaceholder(placeholder ?? ''),
          autocompletion({ override: [variableCompletions(() => suggestionsRef.current)] }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString(), { cursor: update.state.selection.main.head })
            }
          }),
        ],
      }),
    })

    editorRef.current = editor
    return () => {
      editor.destroy()
      editorRef.current = undefined
    }
  }, [describedBy, disabled, error, label, name, placeholder])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const currentValue = editor.state.doc.toString()
    if (currentValue === value) return

    editor.dispatch({ changes: { from: 0, insert: value, to: currentValue.length } })
  }, [value])

  return (
    <div className={className}>
      <div
        className={twMerge(
          clsx(
            'relative min-h-40 overflow-hidden rounded border border-neutral bg-surface-neutral text-sm text-neutral focus-within:border-brand-strong focus-within:outline focus-within:outline-1 focus-within:outline-brand-strong',
            error && 'border-negative focus-within:border-negative focus-within:outline-negative',
            disabled && 'cursor-not-allowed border-neutral bg-surface-neutral-subtle text-neutral-disabled',
            '[&_.cm-content]:min-h-40 [&_.cm-content]:px-3 [&_.cm-content]:pb-3 [&_.cm-content]:pt-9 [&_.cm-placeholder]:text-neutral-subtle',
            editorClassName
          )
        )}
      >
        <div
          data-prompt-label
          className={hideLabel ? 'sr-only' : 'absolute left-3 top-3 z-10 flex items-center gap-0.5'}
        >
          <label className="pointer-events-none text-xs font-medium text-neutral" htmlFor={name}>
            {label}
          </label>
          {labelAction}
        </div>
        <div ref={containerRef} id={name} />
        {actions}
      </div>
      {hint && !error ? (
        <div id={describedBy} className="mt-0.5 px-3 text-xs text-neutral-subtle">
          {hint}
        </div>
      ) : null}
      {error ? (
        <p id={describedBy} className="mt-1 px-3 text-xs font-medium text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
})
