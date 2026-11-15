import { CopyButton } from '@qovery/shared/ui'

/** A shell command with a copy button, the same block as the MCP server settings page. */
export function CommandBlock({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral">
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-code text-sm text-neutral">
        <span className="select-none text-neutral-subtle">$ </span>
        {command}
      </code>
      <div className="shrink-0">
        <CopyButton content={command} />
      </div>
    </div>
  )
}
