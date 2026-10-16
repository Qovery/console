import { Outlet, createFileRoute } from '@tanstack/react-router'
import { OnboardingProvider } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding')({
  component: () => (
    <OnboardingProvider>
      <Outlet />
    </OnboardingProvider>
  ),
})
