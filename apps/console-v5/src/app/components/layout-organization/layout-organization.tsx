import { type PropsWithChildren } from 'react'
import { Icon, Navbar } from '@qovery/shared/ui'
import { Header } from '../header/header'

export function LayoutOrganization({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {/* TODO: Conflicts with body main:not(.h-screen, .layout-onboarding) */}
      <main className="!h-full">
        <div className="sticky top-0 border-b border-neutral bg-background-secondary px-4">
          <Navbar.Root activeId="overview" className="container relative top-[1px] -mt-[1px]">
            <Navbar.Item id="overview" href="/">
              <Icon iconName="table-layout" />
              Overview
            </Navbar.Item>
            <Navbar.Item id="security" href="/">
              <Icon iconName="lock-keyhole" />
              Security
            </Navbar.Item>
            <Navbar.Item id="alerts" href="/">
              <Icon iconName="light-emergency" />
              Alerts
            </Navbar.Item>
            <Navbar.Item id="clusters" href="/">
              <Icon iconName="cube" />
              Clusters
            </Navbar.Item>
            <Navbar.Item id="settings" href="/">
              <Icon iconName="gear-complex" />
              Settings
            </Navbar.Item>
          </Navbar.Root>
        </div>
        <div className="h-full w-full">{children}</div>
      </main>
    </>
  )
}

export default LayoutOrganization
