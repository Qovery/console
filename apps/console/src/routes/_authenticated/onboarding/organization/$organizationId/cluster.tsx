import { createFileRoute } from '@tanstack/react-router'
import { OnboardingCluster } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding/organization/$organizationId/cluster')({
  component: OnboardingCluster,
})
