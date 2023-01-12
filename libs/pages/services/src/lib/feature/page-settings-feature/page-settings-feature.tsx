import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_DEPLOYMENT_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_ENVIRONMENTS_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

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
    },
    {
      title: 'Preview Environments',
      icon: 'icon-solid-eye',
      url: pathSettings + SERVICES_SETTINGS_PREVIEW_ENV_URL,
    },
    {
      title: 'Danger zone',
      icon: 'icon-solid-skull',
      url: pathSettings + SERVICES_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_ENVIRONMENTS_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SERVICES_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
