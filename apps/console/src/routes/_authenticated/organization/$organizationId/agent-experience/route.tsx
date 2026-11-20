import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AgentExperienceNav } from '@qovery/domains/skill-presets/feature'
import { ErrorBoundary } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
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
