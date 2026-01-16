import useCreditCards from '../use-credit-cards/use-credit-cards'
import useCurrentCost from '../use-current-cost/use-current-cost'

export interface UseClusterCreationRestrictionProps {
  organizationId: string
}

/**
 * Hook to determine if cluster creation should be restricted.
 *
 * Clusters (except demo) are restricted when:
 * - User is in an active free trial (inverse of the free-trial-banner hide condition)
 * - AND user has no credit card registered
 *
 * @see https://qovery.slack.com/archives/C02P3MA2NKT/p1768564947277349
 */
export function useClusterCreationRestriction({ organizationId }: UseClusterCreationRestrictionProps) {
  const { data: currentCost, isFetched: isFetchedCurrentCost } = useCurrentCost({ organizationId })
  const { data: creditCards, isFetched: isFetchedCreditCards } = useCreditCards({ organizationId })

  const remainingTrialDays = currentCost?.remaining_trial_day

  // Check if user is in active free trial
  // This is the inverse of the condition in free-trial-banner.tsx that hides the banner
  // Original condition (to hide banner):
  //   remainingTrialDays === undefined || remainingTrialDays <= 0 || remainingTrialDays > 90 || !isFetchedCurrentCost
  // Inverse (user is in active trial):
  //   remainingTrialDays is defined AND > 0 AND <= 90 AND data is fetched
  const isInActiveFreeTrial =
    isFetchedCurrentCost && remainingTrialDays !== undefined && remainingTrialDays > 0 && remainingTrialDays <= 90

  // Check if user has no credit card
  const hasNoCreditCard = isFetchedCreditCards && (!creditCards || creditCards.length === 0)

  // Clusters are restricted if user is in free trial AND has no credit card
  const isClusterCreationRestricted = isInActiveFreeTrial && hasNoCreditCard

  const isLoading = !isFetchedCurrentCost || !isFetchedCreditCards

  return {
    isClusterCreationRestricted,
    isLoading,
    isInActiveFreeTrial,
    hasNoCreditCard,
    remainingTrialDays,
  }
}

export default useClusterCreationRestriction
