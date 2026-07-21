import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { match } from 'ts-pattern'
import { PLATFORM_CONFIGURATION_FEATURE_FLAG, useCluster, usePlatformBinding } from '@qovery/domains/clusters/feature'
import { Sidebar } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const isEksAnywhereEnabled = useFeatureFlagEnabled('eks-anywhere')
  const isPlatformConfigurationEnabled = useFeatureFlagEnabled(PLATFORM_CONFIGURATION_FEATURE_FLAG)
  const { data: platformBinding } = usePlatformBinding({
    organizationId,
    clusterId,
    enabled: Boolean(isPlatformConfigurationEnabled),
  })

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

  const dnsProviderLink = {
    title: 'DNS provider',
    to: `${pathSettings}/dns-provider`,
    icon: 'globe' as const,
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

  const addonsLink = {
    title: 'Add-ons',
    to: `${pathSettings}/addons`,
    icon: 'puzzle-piece' as const,
  }

  const advancedSettingsLink = {
    title: 'Advanced settings',
    to: `${pathSettings}/advanced-settings`,
    icon: 'gears' as const,
  }

  const platformConfigurationLink = {
    title: 'Platform configuration',
    to: `${pathSettings}/platform`,
    icon: 'layer-group' as const,
  }

  const dangerZoneLink = {
    title: 'Danger zone',
    to: `${pathSettings}/danger-zone`,
    icon: 'skull' as const,
  }

  const eksAnywhereCluster = isEksAnywhereEnabled && cluster?.kubernetes === 'PARTIALLY_MANAGED'
  const hasPlatformTemplateBinding = Boolean(platformBinding?.templateKey && platformBinding.templateVersion)
  const platformConfigurationLinks =
    isPlatformConfigurationEnabled && hasPlatformTemplateBinding ? [platformConfigurationLink] : []

  const LINKS_SETTINGS = match(cluster)
    .with({ kubernetes: 'SELF_MANAGED' }, () => [
      generalLink,
      dnsProviderLink,
      imageRegistryLink,
      advancedSettingsLink,
      ...platformConfigurationLinks,
      dangerZoneLink,
    ])
    .with(
      { cloud_provider: 'AWS', kubernetes: 'MANAGED' },
      { cloud_provider: 'AWS', kubernetes: 'PARTIALLY_MANAGED' },
      () => {
        return [
          generalLink,
          ...(eksAnywhereCluster ? [eksLink] : []),
          credentialsLink,
          ...(eksAnywhereCluster ? [] : [resourcesLink]),
          imageRegistryLink,
          ...(eksAnywhereCluster ? [] : [networkLink]),
          dnsProviderLink,
          addonsLink,
          ...(eksAnywhereCluster ? [] : [advancedSettingsLink]),
          ...platformConfigurationLinks,
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
      dnsProviderLink,
      advancedSettingsLink,
      ...platformConfigurationLinks,
      dangerZoneLink,
    ])
    .with({ cloud_provider: 'GCP' }, () => [
      generalLink,
      credentialsLink,
      imageRegistryLink,
      networkLink,
      dnsProviderLink,
      addonsLink,
      advancedSettingsLink,
      ...platformConfigurationLinks,
      dangerZoneLink,
    ])
    .with({ cloud_provider: 'AZURE' }, () => [
      generalLink,
      credentialsLink,
      resourcesLink,
      imageRegistryLink,
      networkLink,
      dnsProviderLink,
      advancedSettingsLink,
      ...platformConfigurationLinks,
      dangerZoneLink,
    ])
    .otherwise(() => [])

  return (
    <div className="flex min-h-0 flex-1">
      <aside
        className={twMerge(
          clsx('relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral', {
            'w-60': eksAnywhereCluster,
          })
        )}
      >
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
