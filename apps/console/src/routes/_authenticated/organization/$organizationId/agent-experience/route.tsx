import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AgentExperienceNav } from '@qovery/domains/skill-presets/feature'
import { ErrorBoundary } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="relative shrink-0 self-stretch border-b border-neutral pb-4 md:min-h-[calc(100dvh-2.75rem-4rem)] md:w-52 md:border-b-0 md:border-r md:pb-0">
        <div className="md:sticky md:top-16">
          <AgentExperienceNav />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="container mx-auto h-full px-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
