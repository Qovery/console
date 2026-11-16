import { CopyButton } from '@qovery/shared/ui'

/**
 * A shell command (or a config snippet, with `prompt={false}`) with a copy button. `copyLabel` names
 * the button for screen readers, as several blocks share a page: "Copy the CLI install command".
 */
export function CommandBlock({
  command,
  copyLabel,
  prompt = true,
}: {
  command: string
  copyLabel?: string
  prompt?: boolean
}) {
  const isMultiline = command.includes('\n')
  return (
    <div
      className={`flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral ${
        isMultiline ? 'items-start' : 'items-center'
      }`}
    >
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-code text-sm text-neutral">
        {prompt && <span className="select-none text-neutral-subtle">$ </span>}
        {command}
      </code>
      <div className="shrink-0">
        <CopyButton content={command} aria-label={copyLabel} />
      </div>
    </div>
  )
}
