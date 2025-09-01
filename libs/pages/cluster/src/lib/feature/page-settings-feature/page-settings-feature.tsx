import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_EKS_ANYWHERE_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_CLUSTER_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const isEksAnywhereEnabled = useFeatureFlagEnabled('eks-anywhere')

  useDocumentTitle('Cluster - Settings')

  const pathSettings = CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL

  const generalLink = {
    title: 'General',
    icon: IconAwesomeEnum.WHEEL,
    url: pathSettings + CLUSTER_SETTINGS_GENERAL_URL,
  }

  const eksLink = {
    title: 'EKS Anywhere configuration',
    icon: IconAwesomeEnum.CLOUD,
    url: pathSettings + CLUSTER_SETTINGS_EKS_ANYWHERE_URL,
  }

  const credentialsLink = {
    title: 'Credentials',
    icon: IconAwesomeEnum.KEY,
    url: pathSettings + CLUSTER_SETTINGS_CREDENTIALS_URL,
  }

  const resourcesLink = {
    title: 'Resources',
    icon: IconAwesomeEnum.CHART_BULLET,
    url: pathSettings + CLUSTER_SETTINGS_RESOURCES_URL,
  }

  const imageRegistryLink = {
    title: 'Mirroring registry',
    icon: IconAwesomeEnum.BOX,
    url: pathSettings + CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  }

  const networkLink = {
    title: 'Network',
    icon: IconAwesomeEnum.PLUG,
    url: pathSettings + CLUSTER_SETTINGS_NETWORK_URL,
  }

  const advancedSettingsLink = {
    title: 'Advanced settings',
    icon: IconAwesomeEnum.GEARS,
    url: pathSettings + CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  }

  const dangerZoneLink = {
    title: 'Danger zone',
    icon: IconAwesomeEnum.SKULL,
    url: pathSettings + CLUSTER_SETTINGS_DANGER_ZONE_URL,
  }

  const links = match(cluster)
    .with({ kubernetes: 'SELF_MANAGED' }, () => [generalLink, imageRegistryLink, advancedSettingsLink, dangerZoneLink])
    .with(
      { cloud_provider: 'AWS', kubernetes: 'MANAGED' },
      { cloud_provider: 'AWS', kubernetes: 'PARTIALLY_MANAGED' },
      () => {
        const shouldShowEksLink = isEksAnywhereEnabled && cluster?.kubernetes === 'PARTIALLY_MANAGED'
        return [
          generalLink,
          ...(shouldShowEksLink ? [eksLink] : []),
          credentialsLink,
          resourcesLink,
          imageRegistryLink,
          networkLink,
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
    <PageSettings links={links}>
      <Routes>
        {ROUTER_CLUSTER_SETTINGS.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + CLUSTER_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
