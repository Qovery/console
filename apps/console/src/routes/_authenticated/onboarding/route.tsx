import { Link, Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { OnboardingCard, OnboardingCopilot } from '@qovery/domains/onboarding/feature'
import { LogoBrandedIcon } from '@qovery/shared/ui'
import { UserMenu } from '../../../app/components/header/user-menu/user-menu'

export const Route = createFileRoute('/_authenticated/onboarding')({
  component: OnboardingLayout,
})

function OnboardingLayout() {
  const matchRoute = useMatchRoute()
  const step = match({
    isProfile: Boolean(matchRoute({ to: '/onboarding/profile' })),
    isDemoCluster: Boolean(matchRoute({ to: '/onboarding/organization/$organizationId/demo-cluster' })),
  })
    .with({ isProfile: true }, () => 1 as const)
    .with({ isDemoCluster: true }, () => 3 as const)
    .otherwise(() => 2 as const)
  return (
    <div data-onboarding-profile className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-background-secondary">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link
          to="/"
          aria-label="Qovery home"
          className="focus-visible:ring-brand rounded focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background-secondary"
        >
          <LogoBrandedIcon className="h-6 w-auto text-neutral" role="img" aria-label="Qovery" />
        </Link>
        <UserMenu />
      </header>
      <main className="layout-onboarding flex min-h-full shrink-0 flex-col items-center justify-start px-4 pb-6 pt-24 sm:justify-center sm:py-20">
        <OnboardingCard step={step}>
          <Outlet />
        </OnboardingCard>
        {step !== 1 && <OnboardingCopilot />}
      </main>
    </div>
  )
}
