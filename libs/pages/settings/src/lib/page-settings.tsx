import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SETTINGS_CLUSTER_URL, SETTINGS_GENERAL_URL, SETTINGS_URL } from '@qovery/shared/router'
import { ROUTER_SETTINGS } from './router/router'
import { Container } from './ui/container/container'

export function PageSettings() {
  const { organizationId = '' } = useParams()

  const pathSettings = SETTINGS_URL(organizationId)

  const links = [
    {
      title: 'General',
      icon: 'icon-solid-wheel',
      url: pathSettings + SETTINGS_GENERAL_URL,
    },
    {
      title: 'Cluster',
      icon: 'icon-solid-cloud',
      url: pathSettings + SETTINGS_CLUSTER_URL,
    },
  ]

  return (
    <Container links={links}>
      <Routes>
        {ROUTER_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + SETTINGS_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageSettings
