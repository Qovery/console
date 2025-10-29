import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import {
  APPLICATION_MONITORING_ALERTS_URL,
  APPLICATION_MONITORING_GENERAL_URL,
  APPLICATION_MONITORING_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_APPLICATION_MONITORING } from '../../router/router'

export function PageMonitoringFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const isFeatureFlag = useFeatureFlagVariantKey('alerting')

  useDocumentTitle('Application - Monitoring')

  const pathMonitoring = `${APPLICATION_URL(
    organizationId,
    projectId,
    environmentId,
    applicationId
  )}${APPLICATION_MONITORING_URL}`

  const { data: service } = useService({ serviceId: applicationId })

  const links: NavigationLeftLinkProps[] = [
    {
      title: 'Dashboard',
      iconName: 'table-cells-large',
      iconStyle: 'regular',
      url: pathMonitoring + APPLICATION_MONITORING_GENERAL_URL,
    },
    {
      title: 'Alerts',
      iconName: 'light-emergency',
      iconStyle: 'regular',
      url: pathMonitoring + APPLICATION_MONITORING_ALERTS_URL,
    },
  ]

  if (!service) return null

  if (!isFeatureFlag) {
    return (
      <div className="flex flex-1 flex-col">
        <ErrorBoundary>
          <Routes>
            {ROUTER_APPLICATION_MONITORING.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
              />
            ))}
            <Route path="*" element={<Navigate replace to={pathMonitoring + APPLICATION_MONITORING_GENERAL_URL} />} />
          </Routes>
        </ErrorBoundary>
      </div>
    )
  } else {
    return (
      <div className="flex h-full">
        <div className="relative w-72 shrink-0 border-r border-neutral-200 pb-10">
          <NavigationLeft className="sticky top-14 pt-5" links={links} />
        </div>
        <div className="flex flex-1 flex-col">
          <ErrorBoundary>
            <Routes>
              {ROUTER_APPLICATION_MONITORING.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
                />
              ))}
              <Route path="*" element={<Navigate replace to={pathMonitoring + APPLICATION_MONITORING_GENERAL_URL} />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    )
  }
}

export default PageMonitoringFeature
