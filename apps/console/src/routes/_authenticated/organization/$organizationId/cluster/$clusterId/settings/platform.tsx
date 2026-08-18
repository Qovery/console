import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  PLATFORM_CONFIGURATION_FEATURE_FLAG,
  PlatformConfiguration,
  toPlatformCloudVendor,
  toPlatformClusterMode,
  useCluster,
  usePlatformBinding,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Callout, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/platform'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Platform configuration - Cluster settings')

  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const isPlatformConfigurationEnabled = useFeatureFlagEnabled(PLATFORM_CONFIGURATION_FEATURE_FLAG)
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const {
    data: platformBinding,
    isLoading: isPlatformBindingLoading,
    isError: isPlatformBindingError,
  } = usePlatformBinding({
    organizationId,
    clusterId,
    enabled: Boolean(isPlatformConfigurationEnabled),
  })
  const clusterMode = toPlatformClusterMode(cluster?.kubernetes)
  const cloudProvider = toPlatformCloudVendor(cluster?.cloud_provider)

  if (isPlatformConfigurationEnabled === undefined) return null

  // A binding fetch error is not "no binding": surface it instead of silently
  // redirecting the user off the page.
  if (isPlatformBindingError) {
    return (
      <Section className="p-8">
        <SettingsHeading
          title="Platform configuration"
          description="Choose platform layers and configure their components. Changes are applied on the next cluster deployment."
        />
        <Callout.Root color="red" className="max-w-content-with-navigation-left">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>The platform configuration could not be loaded. Refresh the page to try again.</Callout.Text>
        </Callout.Root>
      </Section>
    )
  }

  if (
    isPlatformConfigurationEnabled === false ||
    (!isPlatformBindingLoading && !platformBinding) ||
    (!isClusterLoading && (!clusterMode || !cloudProvider))
  ) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/settings/general"
        params={{ organizationId, clusterId }}
        replace
      />
    )
  }

  if (isPlatformBindingLoading || isClusterLoading || !clusterMode || !cloudProvider) return null

  return (
    <Section className="p-8">
      <SettingsHeading
        title="Platform configuration"
        description="Choose platform layers and configure their components. Changes are applied on the next cluster deployment."
      />
      <div className="max-w-content-with-navigation-left">
        <PlatformConfiguration
          key={clusterId}
          organizationId={organizationId}
          clusterId={clusterId}
          clusterMode={clusterMode}
          cloudProvider={cloudProvider}
        />
      </div>
    </Section>
  )
}
