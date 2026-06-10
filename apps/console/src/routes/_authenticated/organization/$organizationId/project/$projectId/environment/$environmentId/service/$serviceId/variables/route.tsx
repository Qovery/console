import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Badge, Heading, Icon, LoaderSpinner, Navbar, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables'
)({
  component: RouteComponent,
})

const tabs = [
  {
    id: 'custom',
    label: 'Custom',
    iconName: 'sliders' as IconName,
    routeId:
      '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/',
  },
  {
    id: 'external-secrets',
    label: 'External secrets',
    iconName: 'lock-keyhole' as IconName,
    routeId:
      '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets',
  },
  {
    id: 'built-in',
    label: 'Built-in',
    iconName: 'cube' as IconName,
    routeId:
      '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/built-in',
  },
]

const OutletLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <LoaderSpinner className="w-6" />
  </div>
)

function TabLabel({ label, isNew }: { label: string; isNew?: boolean }) {
  return (
    <>
      {label}
      {isNew && (
        <Badge size="sm" radius="full" variant="surface" color="sky">
          New
        </Badge>
      )}
    </>
  )
}

function RouteComponent() {
  const matchRoute = useMatchRoute()

  const activeTabId = tabs.find((tab) => matchRoute({ to: tab.routeId }))?.id

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pb-16 pt-6">
      <Section className="gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Service variables</Heading>
          </div>
          <hr className="w-full border-neutral" />
        </div>

        <div className="flex flex-col">
          <div className="relative overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
            <div className="bg-surface-neutral-subtle px-4 pb-2">
              <Navbar.Root activeId={activeTabId} className="relative">
                {tabs.map((tab) => (
                  <Navbar.Item key={tab.id} id={tab.id} to={tab.routeId}>
                    <Icon iconName={tab.iconName} iconStyle="regular" />
                    <TabLabel label={tab.label} isNew={tab.id === 'external-secrets'} />
                  </Navbar.Item>
                ))}
              </Navbar.Root>
            </div>
          </div>

          <div className="relative -mt-2 rounded-lg">
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <Suspense fallback={<OutletLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
