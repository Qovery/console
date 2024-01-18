import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentsProps {
  projectId: string
}

export function useEnvironments({ projectId }: UseEnvironmentsProps) {
  return useQuery({
    ...queries.environments.list({ projectId }),
  })
}

export default useEnvironments
