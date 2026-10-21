import { createFileRoute } from '@tanstack/react-router'
import { OnboardingDemoCluster } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding/organization/$organizationId/demo-cluster')({
  component: OnboardingDemoCluster,
})
