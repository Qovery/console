import { Outlet, createFileRoute, useParams, useRouterState } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  RBAC_V2_PAGES,
  RbacPrototypeProvider,
  RbacV2ModeSwitch,
  stageAtLeast,
  useRbacPrototype,
} from '@qovery/domains/organizations/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings')({
  component: RouteComponent,
})

// RBAC v2 prototype: the provider keeps the MVP/Target mode and the mock data shared across the settings pages
function RouteComponent() {
  return (
    <RbacPrototypeProvider>
      <SettingsLayout />
    </RbacPrototypeProvider>
  )
}

function SettingsLayout() {
  const { organizationId = '' } = useParams({ strict: false })
  const { mode, isTarget, hasTags } = useRbacPrototype()
  const {
    location: { pathname },
  } = useRouterState()
  const { roles } = useUserRole()
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))

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

  // RBAC v2 prototype: Qovery tags, used to scope roles, in Next
  const tagsLink = {
    title: 'Tags',
    to: `${pathSettings}/tags`,
    icon: 'tag' as const,
    badge: 'New',
  }

  const teamLink = {
    type: 'group',
    title: 'Team',
    icon: 'users' as const,
    children: RBAC_V2_PAGES.filter((page) => stageAtLeast(mode, page.since ?? 'mvp')).map((page) => ({
      title: (page.navTitle ?? page.title)(isTarget),
      to: `${pathSettings}/${page.id}`,
    })),
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

  const webhookLink = {
    title: 'Webhook',
    to: `${pathSettings}/webhook`,
    icon: 'webhook' as const,
  }

  const apiTokenLink = {
    type: 'group',
    title: 'API token',
    icon: 'rectangle-api' as const,
    children: [
      { title: 'Token', to: `${pathSettings}/api-token` },
      { title: 'Policy token (New)', to: `${pathSettings}/policy-api-token` },
    ],
  }

  const aiLink = {
    type: 'group',
    title: 'AI settings',
    icon: 'sparkles' as const,
    children: [
      { title: 'Copilot', to: `${pathSettings}/ai-copilot` },
      { title: 'Skills', to: `${pathSettings}/skills` },
    ],
  }

  const agentsLink = {
    type: 'group',
    title: 'Agent',
    icon: 'robot' as const,
    children: [
      { title: 'Token', to: `${pathSettings}/agents/tokens` },
      { title: 'MCP', to: `${pathSettings}/agents/mcps` },
    ],
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
    ...(hasTags ? [tagsLink] : []),
    argoCdIntegrationLink,
    containerRegistriesLink,
    helmRepositoriesLink,
    cloudCredentialsLink,
    gitRepositoriesAccessLink,
    webhookLink,
    // RBAC v2 prototype: in the target solution, service accounts and personal tokens replace the API tokens
    ...(isTarget ? [] : [apiTokenLink]),
    aiLink,
    ...(isAgenticWorkflowEnabled ? [agentsLink] : []),
    ...(isOrganizationAdmin ? [dangerZoneLink] : []),
  ]

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            {LINKS_SETTINGS.map((link) => {
              if ('children' in link) {
                const isChildPathActive = (childPath: string) =>
                  pathname === childPath || pathname.startsWith(`${childPath}/`)
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
                  badge={'badge' in link ? link.badge : undefined}
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
      <RbacV2ModeSwitch />
    </div>
  )
}
