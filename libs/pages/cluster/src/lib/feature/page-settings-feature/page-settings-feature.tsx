import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
} from '@qovery/shared/routes'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_CLUSTER_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  useDocumentTitle('Cluster - Settings')

  const pathSettings = CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL

  const links = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: pathSettings + CLUSTER_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Credentials',
      icon: IconAwesomeEnum.KEY,
      url: pathSettings + CLUSTER_SETTINGS_CREDENTIALS_URL,
    },
    {
      title: 'Resources',
      icon: IconAwesomeEnum.CHART_BULLET,
      url: pathSettings + CLUSTER_SETTINGS_RESOURCES_URL,
    },
    {
      title: 'Features',
      icon: IconAwesomeEnum.PUZZLE_PIECE,
      url: pathSettings + CLUSTER_SETTINGS_FEATURES_URL,
    },
    {
      title: 'Network',
      icon: IconAwesomeEnum.PLUG,
      url: pathSettings + CLUSTER_SETTINGS_NETWORK_URL,
    },
    {
      title: 'Advanced settings',
      icon: IconAwesomeEnum.GEARS,
      url: pathSettings + CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
    },
    {
      title: 'Danger zone',
      icon: IconAwesomeEnum.SKULL,
      url: pathSettings + CLUSTER_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_CLUSTER_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + CLUSTER_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
