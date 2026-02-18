import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import useClusterCreationRestriction from '../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'

const NO_CREDIT_CARD = 'NO_CREDIT_CARD'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const { data: userSignUp } = useUserSignUp()
  const hasDxAuth = Boolean(userSignUp?.dx_auth)
  const { billingDeploymentRestriction, isInActiveFreeTrial, remainingTrialDays } = useClusterCreationRestriction({
    organizationId,
    dxAuth: hasDxAuth,
  })
  const { showChat } = useSupportChat()

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  const hasRestriction = billingDeploymentRestriction != null
  const isNoCreditCardRestriction = billingDeploymentRestriction === NO_CREDIT_CARD

  // Show the banner when there is any billing restriction or an active free trial
  const shouldShowBanner = hasRestriction || isInActiveFreeTrial

  const shouldHideBanner = useMemo(
    () => !shouldShowBanner || isOnOrganizationBillingSummaryPage || hasDxAuth,
    [shouldShowBanner, isOnOrganizationBillingSummaryPage, hasDxAuth]
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

  // Free trial (NO_CREDIT_CARD or client-side detection)
  // Add + 1 because Chargebee return 0 when the trial is ending today
  const days = (remainingTrialDays ?? 0) + 1
  const hasTrialDaysInfo = remainingTrialDays !== undefined && remainingTrialDays > 0
  const message = hasTrialDaysInfo
    ? `Your free trial plan expires ${days} ${pluralize(days, 'day')} from now. If you need help, please contact us.`
    : 'You are on a free trial. Add a credit card to unlock managed cluster creation. If you need help, please contact us.'

  return (
    <Banner color="brand" buttonIconRight="arrow-right" buttonLabel="Need help" onClickButton={() => showChat()}>
      {message}
    </Banner>
  )
}

export default FreeTrialBanner
