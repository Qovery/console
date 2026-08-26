import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import useClusterCreationRestriction from '../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const {
    isClusterCreationRestricted: hasRestriction,
    isInActiveFreeTrial,
    remainingTrialDays,
  } = useClusterCreationRestriction({
    organizationId,
  })
  const { showChat, showPylonForm } = useSupportChat()

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

  if (hasRestriction) {
    return (
      <Banner color="red" buttonIconRight="arrow-right" buttonLabel="Contact us" onClickButton={() => showChat()}>
        Deployments are restricted on your organization. Please contact support to resolve this issue.
      </Banner>
    )
  }

  const days = (remainingTrialDays ?? 0) + 1
  const message = `Your free trial plan expires ${days} ${pluralize(days, 'day')} from now. Activate your plan to keep full access to Qovery.`

  return (
    <Banner
      color="brand"
      buttonIconRight="arrow-right"
      buttonLabel="Activate my plan"
      onClickButton={() => showPylonForm('ask-for-activation')}
    >
      {message}
    </Banner>
  )
}

export default FreeTrialBanner
