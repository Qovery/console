import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import {
  DATABASE_SETTINGS_DANGER_ZONE_URL,
  DATABASE_SETTINGS_GENERAL_URL,
  DATABASE_SETTINGS_RESOURCES_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_DATABASE_SETTINGS } from '../../router/router'
import PageSettings from '../../ui/page-settings/page-settings'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const { data: database } = useService({ environmentId, serviceId: databaseId })

  useDocumentTitle('Database - Settings')

  if (!database) return null

  const pathSettings = `${DATABASE_URL(organizationId, projectId, environmentId, databaseId)}${DATABASE_SETTINGS_URL}`

  const links = [
    {
      title: 'General',
      icon: 'icon-solid-wheel',
      url: pathSettings + DATABASE_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Resources',
      icon: 'icon-solid-chart-bullet',
      url: pathSettings + DATABASE_SETTINGS_RESOURCES_URL,
    },
    {
      title: 'Danger zone',
      icon: 'icon-solid-skull',
      url: pathSettings + DATABASE_SETTINGS_DANGER_ZONE_URL,
    },
  ]

  return (
    <PageSettings links={links}>
      <Routes>
        {ROUTER_DATABASE_SETTINGS.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + DATABASE_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
