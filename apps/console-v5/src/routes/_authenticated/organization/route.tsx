import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute, useLocation, useMatches, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { useRecentServices, useServiceSummary } from '@qovery/domains/services/feature'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { DevopsCopilotTrigger } from '@qovery/shared/devops-copilot/feature'
import { ErrorBoundary, Icon, Link, LoaderSpinner, Navbar } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import Header from '../../../app/components/header/header'
import { NotFoundPage } from '../../../app/components/not-found-page/not-found-page'
import { OrganizationBanners } from '../../../app/components/organization-banners/organization-banners'
import { type FileRouteTypes } from '../../../routeTree.gen'

export const Route = createFileRoute('/_authenticated/organization')({
  component: OrganizationRoute,
  loader: async ({ context }) => {
    // Preload data (organizations) without waiting for the queries to complete
    context.queryClient.prefetchQuery({
      ...queries.organizations.list,
    })
    context.queryClient.prefetchQuery({
      ...queries.user.account,
    })
  },
})

type NavigationContext = {
  type: 'organization' | 'cluster' | 'environment' | 'service' | 'project'
  params: Record<string, string>
  tabs: NavigationTab[]
}

type NavigationTab = {
  id: string
  label: string
  iconName: IconName
  routeId: string
}

const ORGANIZATION_TABS: NavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/overview',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    iconName: 'lock-keyhole',
    routeId: '/_authenticated/organization/$organizationId/audit-logs',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    iconName: 'light-emergency',
    routeId: '/_authenticated/organization/$organizationId/alerts',
  },
  {
    id: 'clusters',
    label: 'Clusters',
    iconName: 'cube',
    routeId: '/_authenticated/organization/$organizationId/clusters',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/settings',
  },
]

const CLUSTER_TABS: NavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/cluster/$clusterId/overview',
  },
  {
    id: 'cluster-logs',
    label: 'Cluster Logs',
    iconName: 'scroll',
    routeId: '/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs',
  },
  {
    id: 'cloud-shell',
    label: 'Cloud shell',
    iconName: 'terminal',
    routeId: '/_authenticated/organization/$organizationId/cluster/$clusterId/cloud-shell',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/cluster/$clusterId/settings',
  },
]

const PROJECT_TABS: NavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/overview',
  },
  {
    id: 'deployment-rules',
    label: 'Deployment rules',
    iconName: 'ruler',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/deployment-rules',
  },
  {
    id: 'variables',
    label: 'Variables',
    iconName: 'key',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/variables',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/settings',
  },
]

const ENVIRONMENT_TABS: NavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    iconName: 'rocket',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployments',
  },
  {
    id: 'variables',
    label: 'Variables',
    iconName: 'key',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings',
  },
]

const SERVICE_TABS: NavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    iconName: 'rocket',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments',
  },
  {
    id: 'service-logs',
    label: 'Service Logs',
    iconName: 'scroll',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs',
  },
  {
    id: 'cloud-shell',
    label: 'Cloud shell',
    iconName: 'terminal',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/cloud-shell',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    iconName: 'chart-column',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring',
  },
  {
    id: 'variables',
    label: 'Variables',
    iconName: 'key',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings',
  },
]

function createRoutePatternRegex(routeIdPattern: string): RegExp {
  const patternPath = routeIdPattern.replace('/_authenticated/organization', '/organization')
  return new RegExp('^' + patternPath.replace(/\$(\w+)/g, '[^/]+') + '(/.*)?$')
}

/**
 * To add a new navigation context:
 * 1. Create a new tabs array (example: ENVIRONMENT_TABS) with routeId using the full route ID pattern
 * 2. Add a new entry to NAVIGATION_CONTEXTS with:
 *    - type: the context type (must match NavigationContext['type'])
 *    - routeIdPattern: the route ID pattern to match (example: '/_authenticated/organization/$organizationId/environment/$environmentId')
 *    - tabs: the tabs array for this context
 *    - paramNames: array of parameter names used in the route
 *
 * The order matters: more specific patterns should come first (example: cluster before organization)
 */
const NAVIGATION_CONTEXTS: Array<{
  type: NavigationContext['type']
  routeIdPattern: string
  tabs: NavigationTab[]
  paramNames: string[]
}> = [
  {
    type: 'service',
    routeIdPattern:
      '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId',
    tabs: SERVICE_TABS,
    paramNames: ['organizationId', 'projectId', 'environmentId', 'serviceId'],
  },
  {
    type: 'environment',
    routeIdPattern: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId',
    tabs: ENVIRONMENT_TABS,
    paramNames: ['organizationId', 'projectId', 'environmentId'],
  },
  {
    type: 'project',
    routeIdPattern: '/_authenticated/organization/$organizationId/project/$projectId',
    tabs: PROJECT_TABS,
    paramNames: ['organizationId', 'projectId'],
  },
  {
    type: 'cluster',
    routeIdPattern: '/_authenticated/organization/$organizationId/cluster/$clusterId',
    tabs: CLUSTER_TABS,
    paramNames: ['organizationId', 'clusterId'],
  },
  {
    type: 'organization',
    routeIdPattern: '/_authenticated/organization/$organizationId',
    tabs: ORGANIZATION_TABS,
    paramNames: ['organizationId'],
  },
]

function useNavigationContext(): NavigationContext | null {
  const location = useLocation()
  const params = useParams({ strict: false })
  const pathname = location.pathname
  const { data: service } = useServiceSummary({
    environmentId: params.environmentId,
    serviceId: params.serviceId,
    enabled: Boolean(params.environmentId) && Boolean(params.serviceId),
  })

  for (const context of NAVIGATION_CONTEXTS) {
    const patternRegex = createRoutePatternRegex(context.routeIdPattern)

    if (patternRegex.test(pathname)) {
      const extractedParams: Record<string, string> = {}
      let hasAllParams = true

      for (const paramName of context.paramNames) {
        // @ts-expect-error-next-line paramName should be typed to be used as a key.
        const value = params[paramName]
        if (typeof value === 'string' && value.length > 0) {
          extractedParams[paramName] = value
        } else {
          hasAllParams = false
          break
        }
      }

      if (hasAllParams) {
        const isDatabase = service?.serviceType === 'DATABASE'
        const isManagedDatabase = isDatabase && service.mode === 'MANAGED'

        // Managed databases should not have cloud shell access.
        // Databases should not expose the variables tab.
        const tabs =
          context.type === 'service'
            ? context.tabs.filter(
                (tab) => !(isDatabase && tab.id === 'variables') && !(isManagedDatabase && tab.id === 'cloud-shell')
              )
            : context.tabs

        return {
          type: context.type,
          params: extractedParams,
          tabs,
        }
      }
    }
  }

  const organizationId = params.organizationId
  if (typeof organizationId === 'string' && organizationId.length > 0 && pathname.startsWith('/organization/')) {
    return {
      type: 'organization',
      params: { organizationId },
      tabs: ORGANIZATION_TABS,
    }
  }

  return null
}

function getBaseRouteSegment(routePath: string): string | null {
  const segments = routePath.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  if (!lastSegment) return null

  if (lastSegment.endsWith('s') && lastSegment.length > 1) {
    return lastSegment.slice(0, -1)
  }
  return null
}

function matchesTabRoute(pathname: string, tabPath: string): boolean {
  if (pathname === tabPath || pathname.startsWith(tabPath + '/')) {
    return true
  }

  const baseSegment = getBaseRouteSegment(tabPath)
  if (baseSegment) {
    const basePattern = tabPath.replace(`/${baseSegment}s`, `/${baseSegment}/`)
    if (pathname.startsWith(basePattern)) {
      return true
    }
  }

  return false
}

function useActiveTabId(context: NavigationContext | null): string {
  const location = useLocation()
  const pathname = location.pathname

  if (!context) {
    return '/'
  }

  for (const tab of context.tabs) {
    const tabPath = buildRoutePath(tab.routeId, context.params)
    // Match the tab route with the pathname, including the base route segment
    // Example: /organization/123/clusters -> /organization/123/cluster/new
    if (matchesTabRoute(pathname, tabPath)) {
      return tab.id
    }
  }

  return '/'
}

function buildRoutePath(routeId: string, params: Record<string, string>): string {
  let path = routeId.replace('/_authenticated/organization', '/organization')
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`$${key}`, value)
  }
  return path
}

function NavigationBar({ context }: { context: NavigationContext }) {
  return (
    <>
      {context.tabs.map((tab) => {
        const path = buildRoutePath(tab.routeId, context.params)
        return (
          <Navbar.Item key={tab.id} id={tab.id} to={path}>
            <Icon iconName={tab.iconName} />
            {tab.label}
          </Navbar.Item>
        )
      })}
    </>
  )
}

const fullWidthRouteIds: FileRouteTypes['id'][] = [
  '/_authenticated/organization/$organizationId/alerts',
  '/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs',
  '/_authenticated/organization/$organizationId/cluster/$clusterId/cloud-shell',
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings',
  '/_authenticated/organization/$organizationId/project/$projectId/settings',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings',
  '/_authenticated/organization/$organizationId/settings',
  '/_authenticated/organization/$organizationId/audit-logs',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/cloud-shell',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs',
]

function useFullWidthLayout(): boolean {
  const matches = useMatches()
  return matches.some((match) =>
    fullWidthRouteIds.some((routeId) => match.routeId === routeId || match.routeId?.startsWith(routeId + '/'))
  )
}

const bypassLayoutRouteIds: FileRouteTypes['id'][] = [
  '/_authenticated/organization/$organizationId/cluster/create/$slug',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/create/metric/$metric',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/$alertId/edit',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job',
]

function useBypassLayout(): boolean {
  const matches = useMatches()
  return matches.some((match) =>
    bypassLayoutRouteIds.some((routeId) => match.routeId === routeId || match.routeId?.startsWith(routeId + '/'))
  )
}

function MainLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <LoaderSpinner />
    </div>
  )
}

function OrganizationRoute() {
  const navigationContext = useNavigationContext()
  const activeTabId = useActiveTabId(navigationContext)
  const needsFullWidth = useFullWidthLayout()
  const bypassLayout = useBypassLayout()
  const location = useLocation()
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { addToRecentServices } = useRecentServices({ organizationId })
  const { data: project } = useProject({ organizationId, projectId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service, isFetched: isServiceSummaryFetched } = useServiceSummary({
    environmentId,
    serviceId,
    enabled: Boolean(environmentId) && Boolean(serviceId),
  })
  const isServiceNotFound = Boolean(environmentId) && Boolean(serviceId) && isServiceSummaryFetched && !service
  const serviceNotFoundAction = (
    <Link
      as="button"
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
      params={{ organizationId, projectId, environmentId }}
      size="md"
      className="mt-6 gap-2"
    >
      Go to environment
    </Link>
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [devopsCopilotOpen, setDevopsCopilotOpen] = useState(false)
  const sendMessageRef = useRef<((message: string, createNewChat?: boolean) => void) | null>(null)

  // Keep group-scoped flags aligned with the active organization
  useEffect(() => {
    if (!organizationId) {
      return
    }

    posthog.group('organization_id', organizationId)
    posthog.reloadFeatureFlags()
  }, [organizationId])

  // Add the service to the recent services list (necessary for the spotlight to work)
  useEffect(() => {
    if (service?.id && project?.id && environment?.id) {
      addToRecentServices({
        id: service.id,
        name: service.name,
        description: service.description || '',
        icon_uri: service.icon_uri,
        service_type: service.service_type,
        project_id: project.id,
        project_name: project.name,
        environment_id: environment.id,
        environment_name: environment.name,
        cluster_id: environment.cluster_id,
        job_type: 'job_type' in service ? service.job_type : undefined,
      })
    }
  }, [service?.id, project?.id, environment?.id])

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current

    if (scrollContainer) {
      scrollContainer.scrollTop = 0
    }
  }, [location.pathname])

  if (bypassLayout) {
    return (
      <DevopsCopilotContext.Provider
        value={{
          devopsCopilotOpen,
          setDevopsCopilotOpen,
          sendMessageRef,
        }}
      >
        {isServiceNotFound ? (
          <NotFoundPage
            action={serviceNotFoundAction}
            data={{
              title: 'Service not found',
              message: "This service doesn't exist anymore, or the URL is incorrect.",
            }}
          />
        ) : (
          <Outlet />
        )}
        <DevopsCopilotTrigger />
      </DevopsCopilotContext.Provider>
    )
  }

  return (
    <DevopsCopilotContext.Provider
      value={{
        devopsCopilotOpen,
        setDevopsCopilotOpen,
        sendMessageRef,
      }}
    >
      <div className="flex h-dvh w-full flex-col bg-background">
        {/* TODO: Conflicts with body main:not(.h-screen, .layout-onboarding) */}
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto">
          <ErrorBoundary>
            <OrganizationBanners />
            <Header />

            <Suspense fallback={<MainLoader />}>
              <>
                <div className="sticky top-0 z-header border-b border-neutral bg-background-secondary px-4">
                  <Navbar.Root activeId={activeTabId} className="container relative top-[1px] mx-0 -mt-[1px]">
                    {navigationContext && <NavigationBar context={navigationContext} />}
                  </Navbar.Root>
                </div>

                <div className={needsFullWidth ? 'min-h-0' : 'container mx-auto min-h-0 px-4'}>
                  {isServiceNotFound ? (
                    <NotFoundPage
                      action={serviceNotFoundAction}
                      data={{
                        title: 'Service not found',
                        message: "This service doesn't exist anymore, or the URL is incorrect.",
                      }}
                    />
                  ) : (
                    <Outlet />
                  )}
                </div>
              </>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      <DevopsCopilotTrigger />
    </DevopsCopilotContext.Provider>
  )
}
