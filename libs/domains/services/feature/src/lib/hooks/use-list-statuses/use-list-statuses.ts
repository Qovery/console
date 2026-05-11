import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListStatusesProps {
  environmentId?: string
  suspense?: boolean
}

export function useListStatuses({ environmentId, suspense = false }: UseListStatusesProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.listStatuses(environmentId!!),
    enabled: Boolean(environmentId),
    suspense,
  })
}

export default useListStatuses
