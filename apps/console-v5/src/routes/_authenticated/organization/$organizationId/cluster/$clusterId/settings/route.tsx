import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const isEksAnywhereEnabled = useFeatureFlagEnabled('eks-anywhere')

  const pathSettings = `/organization/${organizationId}/cluster/${clusterId}/settings`

  const generalLink = {
    title: 'General',
    to: `${pathSettings}/general`,
    icon: 'gear' as const,
  }

  const eksLink = {
    title: 'EKS Anywhere configuration',
    to: `${pathSettings}/eks-anywhere`,
    icon: 'cloud' as const,
  }

  const credentialsLink = {
    title: 'Credentials',
    to: `${pathSettings}/credentials`,
    icon: 'key' as const,
  }

  const resourcesLink = {
    title: 'Resources',
    to: `${pathSettings}/resources`,
    icon: 'chart-bullet' as const,
  }

  const imageRegistryLink = {
    title: 'Mirroring registry',
    to: `${pathSettings}/image-registry`,
    icon: 'box' as const,
  }

  const networkLink = {
    title: 'Network',
    to: `${pathSettings}/network`,
    icon: 'plug' as const,
  }

  const advancedSettingsLink = {
    title: 'Advanced settings',
    to: `${pathSettings}/advanced-settings`,
    icon: 'gears' as const,
  }

  const dangerZoneLink = {
    title: 'Danger zone',
    to: `${pathSettings}/danger-zone`,
    icon: 'skull' as const,
  }

  const LINKS_SETTINGS = match(cluster)
    .with({ kubernetes: 'SELF_MANAGED' }, () => [generalLink, imageRegistryLink, advancedSettingsLink, dangerZoneLink])
    .with(
      { cloud_provider: 'AWS', kubernetes: 'MANAGED' },
      { cloud_provider: 'AWS', kubernetes: 'PARTIALLY_MANAGED' },
      () => {
        const eksAnywhereCluster = isEksAnywhereEnabled && cluster?.kubernetes === 'PARTIALLY_MANAGED'
        return [
          generalLink,
          ...(eksAnywhereCluster ? [eksLink] : []),
          credentialsLink,
          ...(eksAnywhereCluster ? [] : [resourcesLink]),
          imageRegistryLink,
          ...(eksAnywhereCluster ? [] : [networkLink]),
          advancedSettingsLink,
          dangerZoneLink,
        ]
      }
    )
    .with({ cloud_provider: 'SCW' }, () => [
      generalLink,
      credentialsLink,
      resourcesLink,
      imageRegistryLink,
      networkLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ cloud_provider: 'GCP' }, () => [
      generalLink,
      credentialsLink,
      imageRegistryLink,
      networkLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .with({ cloud_provider: 'AZURE' }, () => [
      generalLink,
      credentialsLink,
      resourcesLink,
      imageRegistryLink,
      networkLink,
      advancedSettingsLink,
      dangerZoneLink,
    ])
    .otherwise(() => [])

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <aside className="relative min-h-0 w-52  shrink-0 self-stretch border-r border-neutral">
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
