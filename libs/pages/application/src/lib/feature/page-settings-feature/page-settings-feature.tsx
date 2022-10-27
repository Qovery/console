import { Navigate, Route, Routes } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import {
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_APPLICATION_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  useDocumentTitle('Application - Settings')

  const pathSettings = `${APPLICATION_URL(
    organizationId,
    projectId,
    environmentId,
    applicationId
  )}${APPLICATION_SETTINGS_URL}`

  const links = [
    {
      title: 'General',
      icon: 'icon-solid-wheel',
      url: pathSettings + APPLICATION_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Resources',
      icon: 'icon-solid-chart-bullet',
      url: pathSettings + APPLICATION_SETTINGS_RESOURCES_URL,
    },
    {
      title: 'Storage',
      icon: 'icon-solid-hard-drive',
      url: pathSettings + APPLICATION_SETTINGS_STORAGE_URL,
    },
    {
      title: 'Domain',
      icon: 'icon-solid-earth-americas',
      url: pathSettings + APPLICATION_SETTINGS_DOMAIN_URL,
    },
    {
      title: 'Port',
      icon: 'icon-solid-plug',
      url: pathSettings + APPLICATION_SETTINGS_PORT_URL,
    },
    {
      title: 'Advanced settings',
      icon: 'icon-solid-gears',
      url: pathSettings + APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
    },
    {
      title: 'Danger zone',
      icon: 'icon-solid-skull',
      url: pathSettings + APPLICATION_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_APPLICATION_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + APPLICATION_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
