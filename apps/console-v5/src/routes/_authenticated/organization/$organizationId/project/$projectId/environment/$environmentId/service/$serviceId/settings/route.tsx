import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { isHelmGitSource, isJobGitSource } from '@qovery/shared/enums'
import { ErrorBoundary, LoaderSpinner, Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings'
)({
  component: RouteComponent,
})

const OutletLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

type SidebarSettingsLinkItem = {
  title: string
  to: string
  icon: IconName
  iconStyle?: IconStyle
}

type SidebarSettingsGroupItem = {
  title: string
  icon: IconName
  subLinks: Array<{
    title: string
    to: string
  }>
}

const toSettingsPath = (basePath: string, suffix: string) => `${basePath}${suffix}`

function RouteComponent() {
  return (
    <Suspense fallback={<OutletLoader />}>
      <ErrorBoundary>
        <RouteContent />
      </ErrorBoundary>
    </Suspense>
  )
}

function RouteContent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const pathSettings = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId}/settings`

  const linkItem = (title: string, to: string, icon: IconName, iconStyle?: IconStyle): SidebarSettingsLinkItem => ({
    title,
    to,
    icon,
    iconStyle,
  })

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  if (!service) {
    return null
  }

  const generalLink = linkItem('General', toSettingsPath(pathSettings, '/general'), 'gear')

  const valuesOverrideLink: SidebarSettingsGroupItem = {
    title: 'Values',
    icon: 'key' as const,
    subLinks: [
      {
        title: 'Override as file',
        to: toSettingsPath(pathSettings, '/values-override-file'),
      },
      {
        title: 'Override as arguments',
        to: toSettingsPath(pathSettings, '/values-override-arguments'),
      },
    ],
  }

  const networkingLink = linkItem('Networking', toSettingsPath(pathSettings, '/networking'), 'plug')

  const dockerfileLink = linkItem('Dockerfile', toSettingsPath(pathSettings, '/dockerfile'), 'box')

  const configureJobLink: SidebarSettingsLinkItem = {
    title: match(service)
      .with({ serviceType: 'JOB', job_type: 'CRON' }, () => 'Job configuration')
      .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, () => 'Triggers')
      .otherwise(() => 'Configuration'),
    to: toSettingsPath(pathSettings, '/configure'),
    icon: 'gears' as const,
  }

  const resourcesLink = linkItem('Resources', toSettingsPath(pathSettings, '/resources'), 'chart-bullet')
  const storageLink = linkItem('Storage', toSettingsPath(pathSettings, '/storage'), 'hard-drive')
  const domainLink = linkItem('Domain', toSettingsPath(pathSettings, '/domain'), 'earth-americas')
  const portLink = linkItem('Port', toSettingsPath(pathSettings, '/port'), 'plug')
  const healthchecksLink = linkItem('Health checks', toSettingsPath(pathSettings, '/health-checks'), 'shield-check')
  const deploymentRestrictionsLink = linkItem(
    'Deployment restrictions',
    toSettingsPath(pathSettings, '/deployment-restrictions'),
    'cart-flatbed'
  )
  const advancedSettingsLink = linkItem(
    'Advanced settings',
    toSettingsPath(pathSettings, '/advanced-settings'),
    'gears'
  )
  const dangerZoneLink = linkItem('Danger zone', toSettingsPath(pathSettings, '/danger-zone'), 'skull')
  const terraformConfigurationLink = linkItem(
    'Terraform configuration',
    toSettingsPath(pathSettings, '/terraform-configuration'),
    'sliders'
  )
  const terraformArgumentsLink = linkItem(
    'Terraform arguments',
    toSettingsPath(pathSettings, '/terraform-arguments'),
    'play-circle',
    'regular'
  )
  const terraformVariablesLink = linkItem(
    'Terraform variables',
    toSettingsPath(pathSettings, '/terraform-variables'),
    'key'
  )

  const linksSettings = match(service)
    .with({ serviceType: 'APPLICATION' }, () => [
      generalLink,
      resourcesLink,
      storageLink,
      domainLink,
      portLink,
      healthchecksLink,
      deploymentRestrictionsLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ serviceType: 'CONTAINER' }, () => [
      generalLink,
      resourcesLink,
      storageLink,
      domainLink,
      portLink,
      healthchecksLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ serviceType: 'HELM' }, (s) => [
      generalLink,
      valuesOverrideLink,
      networkingLink,
      domainLink,
      ...(isHelmGitSource(s.source) ? [deploymentRestrictionsLink] : []),
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ serviceType: 'TERRAFORM' }, () => [
      generalLink,
      terraformConfigurationLink,
      terraformVariablesLink,
      terraformArgumentsLink,
      resourcesLink,
      deploymentRestrictionsLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ serviceType: 'JOB' }, (s) => [
      generalLink,
      ...(s.job_type === 'LIFECYCLE' && isJobGitSource(s.source) ? [dockerfileLink] : []),
      configureJobLink,
      resourcesLink,
      deploymentRestrictionsLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ serviceType: 'DATABASE' }, () => [generalLink, resourcesLink, dangerZoneLink])
    .exhaustive()

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            {linksSettings.map((link) =>
              'subLinks' in link ? (
                <Sidebar.Group key={link.title} title={link.title} icon={link.icon} defaultOpen>
                  {link.subLinks.map((subLink) => (
                    <Sidebar.SubItem key={subLink.to} to={subLink.to}>
                      {subLink.title}
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
