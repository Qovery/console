import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseWebhooksProps {
  organizationId: string
}

export function useWebhooks({ organizationId }: UseWebhooksProps) {
  return useQuery({
    ...queries.organizations.webhooks({ organizationId }),
  })
}

export default useWebhooks
