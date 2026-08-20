import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents')({
  component: AgentsRoute,
})

function AgentsRoute() {
  const { organizationId } = Route.useParams()
  const {
    location: { pathname },
  } = useRouterState()
  const agentsPath = `/organization/${organizationId}/agents`

  return (
    <div className="flex min-h-0 flex-1">
      <aside aria-label="Agents navigation" className="w-56 shrink-0 overflow-y-auto px-2 pb-2 pt-4">
        <Sidebar.Root>
          <Sidebar.Item
            to="/organization/$organizationId/agents"
            params={{ organizationId }}
            icon="wand-magic-sparkles"
            active={pathname === agentsPath || pathname.startsWith(`${agentsPath}/`)}
          >
            Agentic workflows
          </Sidebar.Item>
        </Sidebar.Root>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto rounded-t-2xl border-x border-t border-neutral bg-background p-6">
        <Outlet />
      </main>
    </div>
  )
}
