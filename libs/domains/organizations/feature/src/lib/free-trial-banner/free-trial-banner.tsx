import { useLocation, useParams } from 'react-router-dom'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import useClusterCreationRestriction from '../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const { data: userSignUp } = useUserSignUp()
  const hasDxAuth = Boolean(userSignUp?.dx_auth)
  const { isInActiveFreeTrial, remainingTrialDays } = useClusterCreationRestriction({
    organizationId,
    dxAuth: hasDxAuth,
  })
  const { showChat } = useSupportChat()

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  if (!isInActiveFreeTrial || isOnOrganizationBillingSummaryPage) {
    return null
  }

  // Add + 1 because Chargebee return 0 when the trial is ending today
  const days = (remainingTrialDays ?? 0) + 1
  const message = `Your free trial plan expires ${days} ${pluralize(days, 'day')} from now. If you need help, please contact us.`

  return (
    <Banner color="brand" buttonIconRight="arrow-right" buttonLabel="Need help" onClickButton={() => showChat()}>
      {message}
    </Banner>
  )
}

export default FreeTrialBanner
