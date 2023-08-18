import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListStatusesProps {
  projectId?: string
}

export function useListStatuses({ projectId }: UseListStatusesProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.listStatuses(projectId!!),
    enabled: Boolean(projectId),
  })
}

export default useListStatuses
