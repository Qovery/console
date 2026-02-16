import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  const pathSettings = `/organization/${organizationId}/settings`

  const generalLink = {
    title: 'General',
    to: `${pathSettings}/general`,
    icon: 'gear' as const,
  }

  const labelsAnnotationsLink = {
    title: 'Labels & annotations',
    to: `${pathSettings}/labels-annotations`,
    icon: 'tags' as const,
  }

  const teamLink = {
    type: 'group',
    title: 'Team',
    icon: 'users' as const,
    children: [
      { title: 'Members', to: `${pathSettings}/members` },
      { title: 'Roles & permissions', to: `${pathSettings}/roles-permissions` },
    ],
  }

  const billingPlansLink = {
    type: 'group',
    title: 'Billing & plans',
    icon: 'credit-card' as const,
    children: [
      { title: 'Billing summary', to: `${pathSettings}/billing-summary` },
      { title: 'Billing details', to: `${pathSettings}/billing-details` },
    ],
  }

  const containerRegistriesLink = {
    title: 'Container registries',
    to: `${pathSettings}/container-registries`,
    icon: 'box' as const,
  }

  const helmRepositoriesLink = {
    title: 'Helm repositories',
    to: `${pathSettings}/helm-repositories`,
    icon: 'plug' as const,
  }

  const cloudCredentialsLink = {
    title: 'Cloud credientials',
    to: `${pathSettings}/cloud-credentials`,
    icon: 'key' as const,
  }

  const gitRepositoriesAccessLink = {
    title: 'Git repositories',
    to: `${pathSettings}/git-repository-access`,
    icon: 'git-alt' as const,
    iconStyle: 'brands' as const,
  }

  const webhookLink = {
    title: 'Webhook',
    to: `${pathSettings}/webhook`,
    icon: 'webhook' as const,
  }

  const apiTokenLink = {
    title: 'API token',
    to: `${pathSettings}/api-token`,
    icon: 'rectangle-api' as const,
  }

  const aiCopilotLink = {
    title: 'AI Copilot',
    to: `${pathSettings}/ai-copilot`,
    icon: 'sparkles' as const,
  }

  const dangerZoneLink = {
    title: 'Danger zone',
    to: `${pathSettings}/danger-zone`,
    icon: 'skull' as const,
  }

  const LINKS_SETTINGS = [
    generalLink,
    teamLink,
    billingPlansLink,
    labelsAnnotationsLink,
    containerRegistriesLink,
    helmRepositoriesLink,
    cloudCredentialsLink,
    gitRepositoriesAccessLink,
    webhookLink,
    apiTokenLink,
    aiCopilotLink,
    dangerZoneLink,
  ]

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            {LINKS_SETTINGS.map((link) =>
              'children' in link ? (
                <Sidebar.Group key={link.title} title={link.title} icon={link.icon}>
                  {link.children.map((child) => (
                    <Sidebar.SubItem key={child.to} to={child.to}>
                      {child.title}
                    </Sidebar.SubItem>
                  ))}
                </Sidebar.Group>
              ) : (
                <Sidebar.Item
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  iconStyle={'iconStyle' in link ? link.iconStyle : undefined}
                >
                  {link.title}
                </Sidebar.Item>
              )
            )}
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
