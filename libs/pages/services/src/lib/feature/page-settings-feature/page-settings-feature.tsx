import { useParams } from 'react-router-dom'
import { Navigate, Route, Routes, useNavigate } from 'react-router'
import {
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_DEPLOYMENT_URL,
  SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
} from '@console/shared/router'
import { NavigationLeft } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { ROUTER_ENVIRONMENTS_SETTINGS } from '../../router/router'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  useDocumentTitle('Services - Settings')

  const pathSettings = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`

  const links = [
    {
      title: 'General',
      icon: 'icon-solid-wheel',
      url: pathSettings + SERVICES_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Deployment',
      icon: 'icon-solid-cart-flatbed',
      url: pathSettings + SERVICES_SETTINGS_DEPLOYMENT_URL,
      subLinks: [
        {
          title: 'General',
          onClick: () => navigate(pathSettings + SERVICES_SETTINGS_DEPLOYMENT_URL),
        },
        {
          title: 'Restrictions',
          onClick: () => navigate(pathSettings + SERVICES_SETTINGS_DEPLOYMENT_URL),
        },
      ],
    },
    {
      title: 'Preview Environments',
      icon: 'icon-solid-eye',
      url: pathSettings + SERVICES_SETTINGS_PREVIEW_ENV_URL,
    },
    {
      title: 'Advanced settings',
      icon: 'icon-solid-gears',
      url: pathSettings + SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
    },
    {
      title: 'Danger zone',
      icon: 'icon-solid-skull',
      url: pathSettings + SERVICES_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <div className="bg-white flex mt-2 min-h-[calc(100%-200px)] rounded-sm">
      <div className="w-72 pt-6 border-r border-element-light-lighter-400">
        <NavigationLeft links={links} />
      </div>
      <Routes>
        {ROUTER_ENVIRONMENTS_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SERVICES_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </div>
  )
}

export default PageSettingsFeature
