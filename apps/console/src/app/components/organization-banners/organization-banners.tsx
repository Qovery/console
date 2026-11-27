import { useParams } from '@tanstack/react-router'
import { useIsBillingUsageEnabled, useOrganization } from '@qovery/domains/organizations/feature'
import { OfferHost, usePricingClient } from '@qovery/shared/billing/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { AnnouncementBanner } from '@qovery/shared/posthog/feature'
import { Banner } from '@qovery/shared/ui'
import { OrganizationFreeTrialBanner } from './organization-free-trial-banner'

export function OrganizationBanners() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { roles, isQoveryAdminUser } = useUserRole()
  const billingEnabled = useIsBillingUsageEnabled()
  const client = usePricingClient()
  const usagePath = `/organization/${encodeURIComponent(organizationId)}/settings/usage`

  const displayQoveryAdminBanner = (() => {
    if (isQoveryAdminUser) {
      const checkIfUserHasOrganization = roles.some((org) => org.includes(organizationId)) ?? true
      return !checkIfUserHasOrganization
    }
    return false
  })()

  return (
    <>
      {displayQoveryAdminBanner ? (
        <Banner color="yellow">
          Qovery admin message - This organization is a customer (<b>{organization?.name}</b>), please be careful with
          actions.
        </Banner>
      ) : null}
      <AnnouncementBanner />
      <OrganizationFreeTrialBanner />
      {billingEnabled && organizationId && (
        <OfferHost
          key={organizationId}
          organizationId={organizationId}
          client={client}
          variant="bar"
          modal={false}
          onReviewProposal={(proposal) => window.location.assign(`${usagePath}?proposal=${proposal.id}`)}
          onAction={(offer) => {
            const action = offer.content.action
            if (action.type === 'url' && action.url) window.open(action.url, '_blank', 'noopener')
            else window.location.assign(usagePath)
          }}
        />
      )}
    </>
  )
}
