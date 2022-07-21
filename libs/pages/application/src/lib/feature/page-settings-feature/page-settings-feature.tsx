import { useParams } from 'react-router-dom'
import { Navigate, Route, Routes } from 'react-router'
import {
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_RESSOURCES_URL,
  APPLICATION_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
} from '@console/shared/router'
import { NavigationLeft } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { ROUTER_APPLICATION_SETTINGS } from '../../router/router'

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
      title: 'Ressources',
      icon: 'icon-solid-eye',
      url: pathSettings + APPLICATION_SETTINGS_RESSOURCES_URL,
    },
    {
      title: 'Storage',
      icon: 'icon-solid-gears',
      url: pathSettings + APPLICATION_SETTINGS_STORAGE_URL,
    },
    {
      title: 'Domain',
      icon: 'icon-solid-gears',
      url: pathSettings + APPLICATION_SETTINGS_DOMAIN_URL,
    },
    {
      title: 'Port',
      icon: 'icon-solid-gears',
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
    <div className="bg-white flex mt-2 min-h-[calc(100%-200px)] rounded-sm">
      <div className="w-72 pt-6 border-r border-element-light-lighter-400">
        <NavigationLeft links={links} />
      </div>
      <Routes>
        {ROUTER_APPLICATION_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + APPLICATION_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </div>
  )
}

export default PageSettingsFeature
