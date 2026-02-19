import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseWebhooksProps {
  organizationId: string
  suspense?: boolean
}

export function useWebhooks({ organizationId, suspense = false }: UseWebhooksProps) {
  return useQuery({
    ...queries.organizations.webhooks({ organizationId }),
    suspense,
  })
}

export default useWebhooks
