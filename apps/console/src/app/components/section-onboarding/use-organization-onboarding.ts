import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type OrganizationOnboardingStatusEnum } from 'qovery-typescript-axios'
import { mutations, organizations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export type { OrganizationOnboardingStatusEnum }

export function useOrganizationOnboarding({ organizationId }: { organizationId: string }) {
  return useQuery({
    ...queries.organizations.onboarding({ organizationId }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateOrganizationOnboarding({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: OrganizationOnboardingStatusEnum) =>
      mutations.updateOrganizationOnboarding({ organizationId, onboardingPatchRequest: { status } }),
    onSuccess(data) {
      queryClient.setQueryData(queries.organizations.onboarding({ organizationId }).queryKey, data)
    },
  })
}
