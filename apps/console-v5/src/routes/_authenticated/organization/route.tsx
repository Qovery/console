import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute, useLocation, useMatches, useParams } from '@tanstack/react-router'
import { Icon, Navbar } from '@qovery/shared/ui'
import Header from '../../../app/components/header/header'
import { type FileRouteTypes } from '../../../routeTree.gen'

export const Route = createFileRoute('/_authenticated/organization')({
  component: OrganizationRoute,
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
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/cluster/$clusterId/settings',
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

  for (const context of NAVIGATION_CONTEXTS) {
    const patternRegex = createRoutePatternRegex(context.routeIdPattern)

    if (patternRegex.test(pathname)) {
      const extractedParams: Record<string, string> = {}
      let hasAllParams = true

      for (const paramName of context.paramNames) {
        const value = params[paramName]
        if (typeof value === 'string' && value.length > 0) {
          extractedParams[paramName] = value
        } else {
          hasAllParams = false
          break
        }
      }

      if (hasAllParams) {
        return {
          type: context.type,
          params: extractedParams,
          tabs: context.tabs,
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

function useActiveTabId(context: NavigationContext | null): string {
  const location = useLocation()
  const pathname = location.pathname

  if (!context) {
    return '/'
  }

  for (const tab of context.tabs) {
    const tabPath = buildRoutePath(tab.routeId, context.params)
    if (pathname === tabPath || pathname.startsWith(tabPath + '/')) {
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
  '/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs',
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings',
]

function useFullWidthLayout(): boolean {
  const matches = useMatches()
  return matches.some((match) =>
    fullWidthRouteIds.some((routeId) => match.routeId === routeId || match.routeId?.startsWith(routeId + '/'))
  )
}

function OrganizationRoute() {
  const navigationContext = useNavigationContext()
  const activeTabId = useActiveTabId(navigationContext)
  const needsFullWidth = useFullWidthLayout()

  return (
    <div className="h-full min-h-dvh w-full bg-background">
      <Header />
      {/* TODO: Conflicts with body main:not(.h-screen, .layout-onboarding) */}
      <main className={`flex flex-1 flex-col ${needsFullWidth ? 'h-full' : '!h-full min-h-0'}`}>
        <div className="sticky top-0 z-header border-b border-neutral bg-background-secondary px-4">
          <Navbar.Root activeId={activeTabId} className="container relative top-[1px] mx-0 -mt-[1px]">
            {navigationContext && <NavigationBar context={navigationContext} />}
          </Navbar.Root>
        </div>
        <div className={needsFullWidth ? 'w-full flex-1' : 'container mx-auto h-full w-full px-4'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
