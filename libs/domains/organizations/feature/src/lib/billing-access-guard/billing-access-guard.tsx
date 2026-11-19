import { useParams } from '@tanstack/react-router'
import { type PropsWithChildren } from 'react'
import { useCanManageBilling } from '@qovery/shared/iam/feature'
import { EmptyState, Section } from '@qovery/shared/ui'

/**
 * Hides billing pages from members who cannot manage billing, so they do not hit API 403s.
 * This is UX only: the API still checks every billing call.
 */
export function BillingAccessGuard({ children }: PropsWithChildren) {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManageBilling, loading } = useCanManageBilling(organizationId)

  if (loading) {
    return null
  }

  if (!canManageBilling) {
    return (
      <Section className="px-8 pb-8 pt-6">
        <EmptyState
          icon="lock"
          title="You do not have access to billing"
          description="Only Owners, Admins and Billing Managers can see billing. Ask one of them."
          className="max-w-content-with-navigation-left"
        />
      </Section>
    )
  }

  return children
}

export default BillingAccessGuard
