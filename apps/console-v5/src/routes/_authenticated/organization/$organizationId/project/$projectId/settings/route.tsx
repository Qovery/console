import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId } = useParams({ strict: false })

  const pathSettings = `/organization/${organizationId}/project/${projectId}/settings`

  const generalLink = {
    title: 'General',
    to: `${pathSettings}/general`,
    icon: 'gear' as const,
  }

  const dangerZoneLink = {
    title: 'Danger zone',
    to: `${pathSettings}/danger-zone`,
    icon: 'skull' as const,
  }

  const LINKS_SETTINGS = [generalLink, dangerZoneLink]

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            {LINKS_SETTINGS.map((link) => (
              <Sidebar.Item key={link.to} to={link.to} icon={link.icon}>
                {link.title}
              </Sidebar.Item>
            ))}
          </Sidebar.Root>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="container mx-auto px-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
