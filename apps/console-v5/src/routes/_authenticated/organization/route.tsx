import { Outlet, createFileRoute, useLocation, useParams, useRouter } from '@tanstack/react-router'
import axios from 'axios'
import { useMemo } from 'react'
import { organizationsQuery } from '@qovery/domains/organizations/feature'
import { Icon, Navbar } from '@qovery/shared/ui'
import { QOVERY_API } from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'
import Header from '../../../app/components/header/header'

export const Route = createFileRoute('/_authenticated/organization')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(organizationsQuery),
})

function RouteComponent() {
  useAuthInterceptor(axios, QOVERY_API)
  const { buildLocation } = useRouter()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const { organizationId = '' } = useParams({ strict: false })

  const activeTabId = useMemo(() => {
    return pathname.split('/').pop()
  }, [pathname])

  return (
    <div className="h-full min-h-dvh w-full bg-background">
      <Header />
      {/* TODO: Conflicts with body main:not(.h-screen, .layout-onboarding) */}
      <main className="!h-full">
        <div className="sticky top-0 border-b border-neutral bg-background-secondary px-4">
          <Navbar.Root activeId={activeTabId} className="container relative top-[1px] mx-0 -mt-[1px]">
            <Navbar.Item
              id="overview"
              to={
                buildLocation({
                  to: '/organization/$organizationId/overview',
                  params: { organizationId },
                }).href
              }
            >
              <Icon iconName="table-layout" />
              Overview
            </Navbar.Item>
            <Navbar.Item
              id="security"
              to={
                buildLocation({
                  to: '/organization/$organizationId/security',
                  params: { organizationId },
                }).href
              }
            >
              <Icon iconName="lock-keyhole" />
              Security
            </Navbar.Item>
            <Navbar.Item
              id="alerts"
              to={
                buildLocation({
                  to: '/organization/$organizationId/alerts',
                  params: { organizationId },
                }).href
              }
            >
              <Icon iconName="light-emergency" />
              Alerts
            </Navbar.Item>
            <Navbar.Item
              id="clusters"
              to={
                buildLocation({
                  to: '/organization/$organizationId/clusters',
                  params: { organizationId },
                }).href
              }
            >
              <Icon iconName="cube" />
              Clusters
            </Navbar.Item>
            <Navbar.Item
              id="settings"
              to={
                buildLocation({
                  to: '/organization/$organizationId/settings',
                  params: { organizationId },
                }).href
              }
            >
              <Icon iconName="gear-complex" />
              Settings
            </Navbar.Item>
          </Navbar.Root>
        </div>
        <div className="m-auto mt-6 h-full w-full max-w-7xl px-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
