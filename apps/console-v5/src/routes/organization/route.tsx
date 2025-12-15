import { Outlet, createFileRoute, useLocation, useParams, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Icon, Navbar } from '@qovery/shared/ui'
import Header from '../../app/components/header/header'

export const Route = createFileRoute('/organization')({
  component: RouteComponent,
})

function RouteComponent() {
  const { buildLocation } = useRouter()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const { orgId = '' } = useParams({ strict: false })

  const activeTabId = useMemo(() => {
    return pathname.split('/').pop()
  }, [pathname])

  return (
    <div className="bg-background h-full min-h-dvh w-full">
      <Header />
      {/* TODO: Conflicts with body main:not(.h-screen, .layout-onboarding) */}
      <main className="!h-full">
        <div className="border-neutral bg-background-secondary sticky top-0 border-b px-4">
          <Navbar.Root activeId={activeTabId} className="container relative top-[1px] mx-0 -mt-[1px]">
            <Navbar.Item
              id="overview"
              href={
                buildLocation({
                  to: '/organization/$orgId/overview',
                  params: { orgId },
                }).href
              }
            >
              <Icon iconName="table-layout" />
              Overview
            </Navbar.Item>
            <Navbar.Item
              id="security"
              href={
                buildLocation({
                  to: '/organization/$orgId/security',
                  params: { orgId },
                }).href
              }
            >
              <Icon iconName="lock-keyhole" />
              Security
            </Navbar.Item>
            <Navbar.Item
              id="alerts"
              href={
                buildLocation({
                  to: '/organization/$orgId/alerts',
                  params: { orgId },
                }).href
              }
            >
              <Icon iconName="light-emergency" />
              Alerts
            </Navbar.Item>
            <Navbar.Item
              id="clusters"
              href={
                buildLocation({
                  to: '/organization/$orgId/clusters',
                  params: { orgId },
                }).href
              }
            >
              <Icon iconName="cube" />
              Clusters
            </Navbar.Item>
            <Navbar.Item
              id="settings"
              href={
                buildLocation({
                  to: '/organization/$orgId/settings',
                  params: { orgId },
                }).href
              }
            >
              <Icon iconName="gear-complex" />
              Settings
            </Navbar.Item>
          </Navbar.Root>
        </div>
        <div className="m-auto mt-6 h-full w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
