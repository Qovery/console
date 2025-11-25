import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import useCurrentCost from '../hooks/use-current-cost/use-current-cost'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: currentCost } = useCurrentCost({ organizationId })

  const remainingTrialDays = currentCost?.remaining_trial_day

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  if (
    remainingTrialDays === undefined ||
    remainingTrialDays < 0 ||
    remainingTrialDays > 2 ||
    isOnOrganizationBillingSummaryPage
  ) {
    return null
  }

  const dayLabel = remainingTrialDays === 1 ? 'day' : 'days'

  const onClick = () => {
    if (!organizationId) return
    navigate(SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL)
  }

  return (
    <Banner color="yellow" buttonIconRight="arrow-right" buttonLabel="Manage billing" onClickButton={onClick}>
      <p>
        Your free trial plan expires {remainingTrialDays} {dayLabel} from now. Your subscription will start
        automatically at the end of your trial.
      </p>
    </Banner>
  )
}

export default FreeTrialBanner
