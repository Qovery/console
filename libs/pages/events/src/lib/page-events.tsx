import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AUDIT_LOGS_GENERAL_URL, AUDIT_LOGS_URL } from '@qovery/shared/routes'
import { ROUTER_EVENTS } from './router/router'

export function PageEvents() {
  const { organizationId = '' } = useParams()

  return (
    <div className="flex flex-col flex-1 bg-white rounded-t">
      <Routes>
        {ROUTER_EVENTS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={AUDIT_LOGS_URL(organizationId) + AUDIT_LOGS_GENERAL_URL} />} />
      </Routes>
    </div>
  )
}

export default PageEvents
