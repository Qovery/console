import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListStatusesProps {
  environmentId?: string
}

export function useListStatuses({ environmentId }: UseListStatusesProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.listStatuses(environmentId!!),
    enabled: Boolean(environmentId),
  })
}

export default useListStatuses
