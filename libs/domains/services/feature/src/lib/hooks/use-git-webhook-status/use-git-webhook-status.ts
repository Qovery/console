import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitWebhookStatusProps {
  serviceId: string
  enabled?: boolean
}

export function useGitWebhookStatus({ serviceId, enabled = true }: UseGitWebhookStatusProps) {
  return useQuery({
    ...queries.services.gitWebhookStatus(serviceId),
    enabled: Boolean(serviceId) && enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export default useGitWebhookStatus
