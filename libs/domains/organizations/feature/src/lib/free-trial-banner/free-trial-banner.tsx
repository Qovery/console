import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import useClusterCreationRestriction from '../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'

const FREE_TRIAL_ADD_CREDIT_CARD_MESSAGE =
  'You are on a free trial. Add a credit card to unlock managed cluster creation. If you need help, please contact us.'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const {
    isClusterCreationRestricted: hasRestriction,
    isNoCreditCardRestriction,
    isInActiveFreeTrial,
    remainingTrialDays,
    hasNoCreditCard,
  } = useClusterCreationRestriction({
    organizationId,
  })
  const { showChat } = useSupportChat()

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  // Show the banner when there is any billing restriction or an active free trial
  const shouldShowBanner = hasRestriction || isInActiveFreeTrial

  const shouldHideBanner = useMemo(
    () => !shouldShowBanner || isOnOrganizationBillingSummaryPage,
    [shouldShowBanner, isOnOrganizationBillingSummaryPage]
  )

  if (shouldHideBanner) {
    return null
  }

  // Generic restriction (not NO_CREDIT_CARD): deployments are blocked
  if (hasRestriction && !isNoCreditCardRestriction) {
    return (
      <Banner color="red" buttonIconRight="arrow-right" buttonLabel="Contact us" onClickButton={() => showChat()}>
        Deployments are restricted on your organization. Please contact support to resolve this issue.
      </Banner>
    )
  }

  // Free trial: ask to add card only when billing restricts cluster creation (NO_CREDIT_CARD), otherwise show expiry countdown
  const days = (remainingTrialDays ?? 0) + 1
  const expiryMessage = `Your free trial plan expires ${days} ${pluralize(days, 'day')} from now. If you need help, please contact us.`
  const message = hasNoCreditCard && isNoCreditCardRestriction ? FREE_TRIAL_ADD_CREDIT_CARD_MESSAGE : expiryMessage

  return (
    <Banner color="brand" buttonIconRight="arrow-right" buttonLabel="Need help" onClickButton={() => showChat()}>
      {message}
    </Banner>
  )
}

export default FreeTrialBanner
