import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { EVENTS_GENERAL_URL, EVENTS_URL } from '@qovery/shared/routes'
import { ROUTER_EVENTS } from './router/router'

export function PageEvents() {
  const { organizationId = '' } = useParams()

  return (
    <div className="-mt-2 -ml-2 -mr-2 px-5 py-2 bg-white border-l border-l-bg-element-light-lighter-400 min-h-screen">
      <Routes>
        {ROUTER_EVENTS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={EVENTS_URL(organizationId) + EVENTS_GENERAL_URL} />} />
      </Routes>
    </div>
  )
}

export default PageEvents
