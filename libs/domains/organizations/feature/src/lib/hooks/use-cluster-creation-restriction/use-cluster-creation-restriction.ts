import { useMemo } from 'react'
import useCurrentCost from '../use-current-cost/use-current-cost'
import useOrganization from '../use-organization/use-organization'

export interface UseClusterCreationRestrictionProps {
  organizationId: string
}

/**
 * Hook to determine if cluster creation should be restricted.
 *
 * Uses the backend-provided `billing_deployment_restriction` field on the organization:
 * - null → no restriction
 * - 'NO_CREDIT_CARD' → free trial restriction (blocks managed cluster creation, allows demo)
 * - any other string → blocks all deployments
 *
 */
export function useClusterCreationRestriction({ organizationId }: UseClusterCreationRestrictionProps) {
  const { data: organization, isFetched: isFetchedOrganization } = useOrganization({ organizationId })
  const { data: currentCost, isFetched: isFetchedCurrentCost } = useCurrentCost({ organizationId })

  const remainingTrialDays = currentCost?.remaining_trial_day

  // TODO: Remove cast once qovery-typescript-axios SDK is regenerated with billing_deployment_restriction field
  const billingDeploymentRestriction = (organization as { billing_deployment_restriction?: string | null } | undefined)
    ?.billing_deployment_restriction

  // Check if user is in active free trial (used by free-trial-banner)
  const isInActiveFreeTrial = useMemo(
    () =>
      isFetchedCurrentCost && remainingTrialDays !== undefined && remainingTrialDays > 0 && remainingTrialDays <= 90,
    [isFetchedCurrentCost, remainingTrialDays]
  )

  // Cluster creation is restricted when the backend sets a billing deployment restriction
  const isClusterCreationRestricted = useMemo(
    () => isFetchedOrganization && billingDeploymentRestriction != null,
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
