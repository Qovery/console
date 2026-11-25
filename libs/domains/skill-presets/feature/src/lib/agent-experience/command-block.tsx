import { type ReactNode } from 'react'
import { CopyButton } from '@qovery/shared/ui'

/** Names the shared copy button for screen readers through a group, when a page holds several. */
export function CopyLabelGroup({ label, children }: { label?: string; children: ReactNode }) {
  if (!label) return <>{children}</>
  return (
    <span role="group" aria-label={label} className="inline-flex">
      {children}
    </span>
  )
}

/**
 * A shell command (or a config snippet, with `prompt={false}`) with the shared copy button. Several
 * blocks share a page, so `copyLabel` names a group around the button for screen readers ("Copy the CLI
 * install command"), leaving the shared button as it is.
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
        <CopyLabelGroup label={copyLabel}>
          <CopyButton content={command} />
        </CopyLabelGroup>
      </div>
    </div>
  )
}
