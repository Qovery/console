import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import useCreditCards from '../hooks/use-credit-cards/use-credit-cards'
import useCurrentCost from '../hooks/use-current-cost/use-current-cost'

export function FreeTrialBanner() {
  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: currentCost } = useCurrentCost({ organizationId })
  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })

  const hasCreditCard = creditCards.length > 0
  const remainingTrialDays = currentCost?.remaining_trial_day

  const isOnOrganizationBillingSummaryPage = pathname.includes(
    SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
  )

  if (remainingTrialDays === undefined || remainingTrialDays < 0 || isOnOrganizationBillingSummaryPage) {
    return null
  }

  const showForCreditCard = hasCreditCard && remainingTrialDays <= 2
  const showForNoCreditCard = !hasCreditCard

  if (!showForCreditCard && !showForNoCreditCard) {
    return null
  }

  const dayLabel = remainingTrialDays === 1 ? 'day' : 'days'

  const onClick = () => {
    if (!organizationId) return
    const target = hasCreditCard
      ? SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL
      : SETTINGS_URL(organizationId) + SETTINGS_BILLING_URL
    navigate(target)
  }

  return (
    <Banner
      color={hasCreditCard ? 'yellow' : 'red'}
      buttonIconRight="arrow-right"
      buttonLabel={hasCreditCard ? 'Manage billing' : 'Add credit card'}
      onClickButton={onClick}
    >
      {hasCreditCard || isLoadingCreditCards ? (
        <p>
          Your free trial plan expires {remainingTrialDays} {dayLabel} from now. Your subscription will start
          automatically at the end of your trial.
        </p>
      ) : (
        <p>
          No credit card registered, your account will be blocked at the end your trial in {remainingTrialDays}{' '}
          {dayLabel}
        </p>
      )}
    </Banner>
  )
}

export default FreeTrialBanner
