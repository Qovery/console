import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type OnboardingStatus = 'IN_PROGRESS' | 'DISMISSED'

export interface OrganizationOnboarding {
  use_cases: string | null
  status: OnboardingStatus | null
}

const queryKey = (organizationId: string) => ['organization-onboarding', organizationId]

async function fetchOnboarding(organizationId: string): Promise<OrganizationOnboarding> {
  const response = await axios.get<OrganizationOnboarding>(`/api/organization/${organizationId}/onboarding`)
  return response.data
}

async function updateOnboarding(organizationId: string, status: OnboardingStatus): Promise<OrganizationOnboarding> {
  const response = await axios.post<OrganizationOnboarding>(`/api/organization/${organizationId}/onboarding`, {
    status,
  })
  return response.data
}

export function useOrganizationOnboarding({ organizationId }: { organizationId: string }) {
  return useQuery({
    queryKey: queryKey(organizationId),
    queryFn: () => fetchOnboarding(organizationId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateOrganizationOnboarding({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: OnboardingStatus) => updateOnboarding(organizationId, status),
    onSuccess(data) {
      queryClient.setQueryData(queryKey(organizationId), data)
    },
  })
}
