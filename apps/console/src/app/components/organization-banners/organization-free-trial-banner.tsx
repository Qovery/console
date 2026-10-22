import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { useClusterCreationRestriction, useCreditCards } from '@qovery/domains/organizations/feature'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'

export function OrganizationFreeTrialBanner() {
  const { organizationId = '' } = useParams({ strict: false })
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const {
    isClusterCreationRestricted: hasRestriction,
    isInActiveFreeTrial,
    remainingTrialDays,
  } = useClusterCreationRestriction({
    organizationId,
  })
  const { data: creditCards = [], isSuccess: isCreditCardsLoaded } = useCreditCards({
    organizationId,
    enabled: Boolean(organizationId) && isInActiveFreeTrial,
  })
  const { showChat } = useSupportChat()

  // Billing pages already display their own trial callout
  const isOnOrganizationBillingPage = [SETTINGS_BILLING_SUMMARY_URL, SETTINGS_BILLING_URL].some((path) =>
    pathname.includes(SETTINGS_URL(organizationId) + path)
  )

  // Once a credit card is added, the chosen plan starts automatically at the end of the trial
  const shouldShowTrialBanner =
    isInActiveFreeTrial && isCreditCardsLoaded && creditCards.length === 0 && !isOnOrganizationBillingPage

  if (hasRestriction) {
    return (
      <Banner color="red" buttonIconRight="arrow-right" buttonLabel="Contact us" onClickButton={() => showChat()}>
        Deployments are restricted on your organization. Please contact support to resolve this issue.
      </Banner>
    )
  }

  if (!shouldShowTrialBanner) {
    return null
  }

  const days = (remainingTrialDays ?? 0) + 1
  const message = `Your free trial plan expires ${days} ${pluralize(days, 'day')} from now. Choose your plan to activate your account and keep full access to Qovery.`

  return (
    <Banner
      color="brand"
      buttonIconRight="arrow-right"
      buttonLabel="Add credit card"
      onClickButton={() =>
        navigate({ to: '/organization/$organizationId/settings/billing-details', params: { organizationId } })
      }
    >
      {message}
    </Banner>
  )
}

export default OrganizationFreeTrialBanner
