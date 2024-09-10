import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PIPELINE_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_RULES_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_ENVIRONMENTS_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  useDocumentTitle('Services - Settings')

  const pathSettings = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`

  const links = [
    {
      title: 'General',
      icon: IconAwesomeEnum.WHEEL,
      url: pathSettings + SERVICES_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Deployment',
      icon: IconAwesomeEnum.CART_FLATBED,
      subLinks: [
        {
          title: 'Rules',
          url: pathSettings + SERVICES_SETTINGS_RULES_URL,
        },
        {
          title: 'Pipeline',
          url: pathSettings + SERVICES_SETTINGS_PIPELINE_URL,
        },
      ],
    },
    {
      title: 'Preview Environments',
      icon: IconAwesomeEnum.EYE,
      url: pathSettings + SERVICES_SETTINGS_PREVIEW_ENV_URL,
    },
    {
      title: 'Danger zone',
      icon: IconAwesomeEnum.SKULL,
      url: pathSettings + SERVICES_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_ENVIRONMENTS_SETTINGS.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SERVICES_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
