import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId, projectId, environmentId } = useParams({ strict: false })
  const basePath = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/automations`
  const agentTaskLinks = [
    { title: 'General', to: basePath },
    { title: 'Runs', to: `${basePath}/runs` },
  ]
  const environmentLinks = [
    { title: 'Deployment rules', to: `${basePath}/settings/deployment-rules` },
    { title: 'Preview environments', to: `${basePath}/settings/preview-environments` },
  ]

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            <Sidebar.Group title="Agent tasks" icon="robot" defaultOpen>
              {agentTaskLinks.map((link) => (
                <Sidebar.SubItem key={link.to} to={link.to}>
                  {link.title}
                </Sidebar.SubItem>
              ))}
            </Sidebar.Group>
            <Sidebar.Group title="Environment" icon="layer-group" defaultOpen>
              {environmentLinks.map((link) => (
                <Sidebar.SubItem key={link.to} to={link.to}>
                  {link.title}
                </Sidebar.SubItem>
              ))}
            </Sidebar.Group>
          </Sidebar.Root>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
