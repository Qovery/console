import { Route, Routes, useParams } from 'react-router-dom'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { ROUTER_ENVIRONMENTS } from './router/router'

export function PageEnvironments() {
  const { projectId = '' } = useParams()
  const { error } = useEnvironments({ projectId })

  if (error) {
    return <NotFoundPage error={error} />
  }

  return (
    <Routes>
      {ROUTER_ENVIRONMENTS.map((route) => (
        <Route key={route.path} path={route.path} element={route.component} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default PageEnvironments
