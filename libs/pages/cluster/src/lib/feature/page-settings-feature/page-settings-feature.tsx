import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_REMOTE_ACCESS_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
} from '@qovery/shared/routes'
import { IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import { ROUTER_CLUSTER_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  useDocumentTitle('Cluster - Settings')

  const cluster = useSelector<RootState, ClusterEntity | undefined>(
    (state: RootState) => selectClusterById(state, clusterId),
    (prev, next) => prev?.cloud_provider !== next?.cloud_provider
  )

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
  ]

  if (cluster?.cloud_provider === CloudProviderEnum.AWS) {
    links.push({
      title: 'Features',
      icon: IconAwesomeEnum.PUZZLE_PIECE,
      url: pathSettings + CLUSTER_SETTINGS_FEATURES_URL,
    })

    if (cluster?.kubernetes === KubernetesEnum.K3_S) {
      links.push({
        title: 'Remote access',
        icon: IconAwesomeEnum.LIGHTBULB,
        url: pathSettings + CLUSTER_SETTINGS_REMOTE_ACCESS_URL,
      })
    }
  }

  links.push(
    ...[
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
  )

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
