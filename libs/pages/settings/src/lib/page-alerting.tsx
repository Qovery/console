import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAlerts } from '@qovery/domains/observability/feature'
import {
  ALERTING_ALERT_RULES_URL,
  ALERTING_ISSUES_URL,
  ALERTING_NOTIFICATION_CHANNEL_URL,
  ALERTING_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_ALERTING } from './router/router'

// NOTE: Alerting is located in the Settings page library to avoid creating a new library,
// as these types of libraries will be removed soon with the upcoming navigation changes.
export function PageAlerting() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Alerting')

  const { data: alerts = [] } = useAlerts({ organizationId })
  const issuesCount = alerts.length

  const alertingLinks: NavigationLeftLinkProps[] = [
    {
      title: (
        <span className="flex w-full items-center justify-between">
          Issues{' '}
          {issuesCount > 0 && (
            <span className="flex min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs text-white">
              {issuesCount}
            </span>
          )}
        </span>
      ),
      iconName: issuesCount > 0 ? 'light-emergency-on' : 'light-emergency',
      iconStyle: 'regular',
      url: ALERTING_URL(organizationId) + ALERTING_ISSUES_URL,
    },
    {
      title: 'Alert rules',
      iconName: 'list-check',
      iconStyle: 'solid',
      url: ALERTING_URL(organizationId) + ALERTING_ALERT_RULES_URL,
    },
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
