import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AUDIT_LOGS_GENERAL_URL, AUDIT_LOGS_URL } from '@qovery/shared/routes'
import { ErrorBoundary } from '@qovery/shared/ui'
import { ROUTER_EVENTS } from './router/router'

export function PageEvents() {
  const { organizationId = '' } = useParams()

  return (
    <div className="flex flex-1 flex-col rounded-t bg-white">
      <ErrorBoundary>
        <Routes>
          {ROUTER_EVENTS.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={AUDIT_LOGS_URL(organizationId) + AUDIT_LOGS_GENERAL_URL} />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default PageEvents
