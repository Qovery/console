import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { ROUTER_ENVIRONMENTS } from './router/router'

export function PageEnvironments() {
  const { organizationId = '', projectId = '' } = useParams()
  const { error } = useEnvironments({ projectId })

  if (error) {
    return <NotFoundPage error={error} />
  }

  const path = ENVIRONMENTS_URL(organizationId, projectId)

  return (
    <Routes>
      {ROUTER_ENVIRONMENTS.map((route) => (
        <Route key={route.path} path={route.path} element={route.component} />
      ))}
      <Route path="*" element={<Navigate replace to={path + ENVIRONMENTS_GENERAL_URL} />} />
    </Routes>
  )
}

export default PageEnvironments
