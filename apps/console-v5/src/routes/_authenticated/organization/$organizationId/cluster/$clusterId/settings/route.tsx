import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Sidebar, type SidebarItemProps } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })

  const pathSettings = `/organization/${organizationId}/cluster/${clusterId}/settings`

  const LINKS_SETTINGS = [
    {
      title: 'General',
      to: `${pathSettings}/general`,
      icon: 'gear-complex',
    },
    {
      title: 'Credentials',
      to: `${pathSettings}/credentials`,
      icon: 'key',
    },
    {
      title: 'Resources',
      to: `${pathSettings}/resources`,
      icon: 'chart-bullet',
    },
    {
      title: 'Mirroring registry',
      to: `${pathSettings}/image-registry`,
      icon: 'box',
    },
    {
      title: 'Network',
      to: `${pathSettings}/network`,
      icon: 'plug',
    },
    {
      title: 'Advanced settings',
      to: `${pathSettings}/advanced-settings`,
      icon: 'gears',
    },
    {
      title: 'Danger zone',
      to: `${pathSettings}/danger-zone`,
      icon: 'skull',
    },
  ] satisfies SidebarItemProps[]

  return (
    <div className="flex h-full gap-4">
      <div className="sticky top-0 min-w-52 border-r border-neutral">
        <Sidebar.Root className="mt-6">
          {LINKS_SETTINGS.map((link) => (
            <Sidebar.Item key={link.to} to={link.to} icon={link.icon}>
              {link.title}
            </Sidebar.Item>
          ))}
        </Sidebar.Root>
      </div>
      <Outlet />
    </div>
  )
}
