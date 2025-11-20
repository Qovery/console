import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { ALERTING_NOTIFICATION_CHANNEL_URL, ALERTING_URL } from '@qovery/shared/routes'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'
import { ROUTER_ALERTING } from './router/router'

// NOTE: Alerting is located in the Settings page library to avoid creating a new library,
// as these types of libraries will be removed soon with the upcoming navigation changes.
export function PageAlerting() {
  const { organizationId = '' } = useParams()

  const alertingLinks: NavigationLeftLinkProps[] = [
    {
      title: 'Notification channel',
      iconName: 'bullhorn',
      iconStyle: 'regular',
      url: ALERTING_URL(organizationId) + ALERTING_NOTIFICATION_CHANNEL_URL,
    },
  ]

  return (
    <div className="flex flex-1 rounded-t bg-white">
      <div className="relative w-72 shrink-0 border-r border-neutral-200 pb-10">
        <div className="sticky top-12">
          <NavigationLeft title="Alerting" links={alertingLinks} className="py-6" />
        </div>
      </div>
      <div className="flex grow">
        <ErrorBoundary>
          <Routes>
            {ROUTER_ALERTING.map((route) => (
              <Route key={route.path} path={route.path} element={route.component} />
            ))}
            <Route
              path="*"
              element={<Navigate replace to={ALERTING_URL(organizationId) + ALERTING_NOTIFICATION_CHANNEL_URL} />}
            />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default PageAlerting
