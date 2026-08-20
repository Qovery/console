import { createFileRoute } from '@tanstack/react-router'
import { Icon, LogoIcon } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/')({
  component: AgentsSpace,
})

function AgentsSpace() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-brand-component">
          <LogoIcon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-medium text-neutral">Agents</h1>
        <p className="mt-2 text-sm text-neutral-subtle">Your agent workspace is coming soon.</p>
        <Icon iconName="sparkles" className="mt-4 text-brand" aria-hidden="true" />
      </div>
    </div>
  )
}
