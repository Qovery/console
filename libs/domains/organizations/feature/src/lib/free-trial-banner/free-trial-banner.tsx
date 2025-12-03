import { useLocation, useParams } from 'react-router-dom'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import useCurrentCost from '../hooks/use-current-cost/use-current-cost'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const { data: currentCost } = useCurrentCost({ organizationId })
  const { data: userSignUp } = useUserSignUp()
  const { showChat, initChat } = useSupportChat()

  if (userSignUp?.dx_auth) {
    return null
  }

  const remainingTrialDays = currentCost?.remaining_trial_day

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  if (remainingTrialDays === undefined || remainingTrialDays < 0 || isOnOrganizationBillingSummaryPage) {
    return null
  }

  const dayLabel = remainingTrialDays === 1 ? 'day' : 'days'

  const onClick = () => {
    initChat()
    showChat()
  }

  return (
    <Banner color="brand" buttonIconRight="arrow-right" buttonLabel="Need help" onClickButton={onClick}>
      <p>
        Your free trial plan expires {remainingTrialDays} {dayLabel} from now. Your subscription will start
        automatically at the end of your trial.
      </p>
    </Banner>
  )
}

export default FreeTrialBanner
