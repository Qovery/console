import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { DATABASE_SETTINGS_DANGER_ZONE_URL, DATABASE_SETTINGS_URL, DATABASE_URL } from '@qovery/shared/routes'
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
      title: 'Danger zone',
      icon: 'icon-solid-skull',
      url: pathSettings + DATABASE_SETTINGS_DANGER_ZONE_URL,
    },
  ]
  const defaultSettingsUrl = links[0]?.url ?? pathSettings + DATABASE_SETTINGS_DANGER_ZONE_URL

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
        <Route path="*" element={<Navigate replace to={defaultSettingsUrl} />} />
      </Routes>
    </PageSettings>
  )
}

export default PageSettingsFeature
