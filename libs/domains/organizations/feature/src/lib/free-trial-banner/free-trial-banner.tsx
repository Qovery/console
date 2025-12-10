import { useLocation, useParams } from 'react-router-dom'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import useCurrentCost from '../hooks/use-current-cost/use-current-cost'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const { data: currentCost, isFetched: isFetchedCurrentCost } = useCurrentCost({ organizationId })
  const { showChat } = useSupportChat()

  const remainingTrialDays = (currentCost?.remaining_trial_day ?? 0) + 1

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  if (
    remainingTrialDays === undefined ||
    remainingTrialDays <= 0 ||
    isOnOrganizationBillingSummaryPage ||
    !isFetchedCurrentCost
  ) {
    return null
  }

  const message = `Your free trial plan expires ${remainingTrialDays} ${pluralize(remainingTrialDays, 'day')} from now. If you need help, please contact us.`

  return (
    <Banner color="brand" buttonIconRight="arrow-right" buttonLabel="Need help" onClickButton={() => showChat()}>
      {message}
    </Banner>
  )
}

export default FreeTrialBanner
