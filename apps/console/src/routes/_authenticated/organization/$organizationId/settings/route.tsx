import { Outlet, createFileRoute, useParams, useRouterState } from '@tanstack/react-router'
import {
  getBillingSettingsLinks,
  hasBillingRole,
  useIsBillingUsageEnabled,
} from '@qovery/domains/organizations/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  const {
    location: { pathname },
  } = useRouterState()
  const { roles } = useUserRole()
  const isBillingUsageEnabled = useIsBillingUsageEnabled()

  const isOrganizationAdmin = roles.some((role) => role.includes(`organization:${organizationId}:admin`))

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
      { title: 'Roles & permissions', to: `${pathSettings}/roles` },
    ],
  }

  const billingPlansLink = {
    type: 'group',
    title: 'Billing & plans',
    icon: 'credit-card' as const,
    children: getBillingSettingsLinks(pathSettings, isBillingUsageEnabled, hasBillingRole(roles, organizationId)),
  }

  const containerRegistriesLink = {
    title: 'Container registries',
    to: `${pathSettings}/container-registries`,
    icon: 'box' as const,
  }

  const argoCdIntegrationLink = {
    title: 'ArgoCD integration',
    to: `${pathSettings}/argocd-integration`,
    icon: 'link' as const,
  }

  const helmRepositoriesLink = {
    title: 'Helm repositories',
    to: `${pathSettings}/helm-repositories`,
    icon: 'plug' as const,
  }

  const cloudCredentialsLink = {
    title: 'Cloud credentials',
    to: `${pathSettings}/cloud-credentials`,
    icon: 'key' as const,
  }

  const gitRepositoriesAccessLink = {
    title: 'Git repositories access',
    to: `${pathSettings}/git-repository-access`,
    icon: 'git-alt' as const,
    iconStyle: 'brands' as const,
  }

  const notificationsLink = {
    type: 'group',
    title: 'Notifications',
    icon: 'bell' as const,
    children: [
      { title: 'Slack', to: `${pathSettings}/notifications/slack` },
      { title: 'Webhook', to: `${pathSettings}/webhook` },
    ],
  }

  // Policy tokens, the Copilot, skills, skill presets, agent activity and the Agent Tasks pages live
  // in the Agents tab. Their old settings paths redirect there.
  const apiTokenLink = {
    title: 'API token',
    to: `${pathSettings}/api-token`,
    icon: 'rectangle-api' as const,
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
    argoCdIntegrationLink,
    containerRegistriesLink,
    helmRepositoriesLink,
    cloudCredentialsLink,
    gitRepositoriesAccessLink,
    notificationsLink,
    apiTokenLink,
    ...(isOrganizationAdmin ? [dangerZoneLink] : []),
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="relative shrink-0 self-stretch border-b border-neutral pb-4 md:min-h-[calc(100dvh-2.75rem-4rem)] md:w-52 md:border-b-0 md:border-r md:pb-0">
        <div className="md:sticky md:top-16">
          <Sidebar.Root className="mt-6">
            {LINKS_SETTINGS.map((link) => {
              if ('children' in link) {
                const isChildPathActive = (childPath: string) =>
                  pathname === childPath ||
                  pathname.startsWith(`${childPath}/`) ||
                  (!isBillingUsageEnabled &&
                    childPath === `${pathSettings}/billing-summary` &&
                    pathname === `${pathSettings}/billing`)
                const groupActive = link.children.some((child) => isChildPathActive(child.to))

                return (
                  <Sidebar.Group key={link.title} title={link.title} icon={link.icon} defaultOpen={groupActive}>
                    {link.children.map((child) => (
                      <Sidebar.SubItem key={child.to} to={child.to} active={isChildPathActive(child.to)}>
                        {child.title}
                      </Sidebar.SubItem>
                    ))}
                  </Sidebar.Group>
                )
              }

              return (
                <Sidebar.Item
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  iconStyle={'iconStyle' in link ? link.iconStyle : undefined}
                >
                  {link.title}
                </Sidebar.Item>
              )
            })}
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
