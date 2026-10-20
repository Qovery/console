import { createFileRoute } from '@tanstack/react-router'
import { OnboardingProfile } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding/profile')({
  component: OnboardingProfile,
})
