import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterCreationRestrictionProps {
  organizationId: string
}

export function useClusterCreationRestriction({ organizationId }: UseClusterCreationRestrictionProps) {
  const { data: organization, isFetched: isFetchedOrganization } = useQuery({
    ...queries.organizations.details({ organizationId }),
  })
  const { data: currentCost, isFetched: isFetchedCurrentCost } = useQuery({
    ...queries.organizations.currentCost({ organizationId }),
  })

  const remainingTrialDays = currentCost?.remaining_trial_day
  const billingDeploymentRestriction = organization?.billing_deployment_restriction

  const isInActiveFreeTrial = useMemo(
    () =>
      isFetchedCurrentCost && remainingTrialDays !== undefined && remainingTrialDays > 0 && remainingTrialDays <= 90,
    [isFetchedCurrentCost, remainingTrialDays]
  )

  const isClusterCreationRestricted = useMemo(
    () =>
      isFetchedOrganization &&
      billingDeploymentRestriction != null &&
      billingDeploymentRestriction !== 'NO_CREDIT_CARD',
    [isFetchedOrganization, billingDeploymentRestriction]
  )

  const isLoading = !isFetchedOrganization || !isFetchedCurrentCost

  return {
    isClusterCreationRestricted,
    isLoading,
    isInActiveFreeTrial,
    billingDeploymentRestriction,
    remainingTrialDays,
  }
}

export default useClusterCreationRestriction
