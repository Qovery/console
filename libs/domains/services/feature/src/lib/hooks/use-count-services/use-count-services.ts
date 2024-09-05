import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCountServicesProps {
  environmentId?: string
}

export function useCountServices({ environmentId }: UseCountServicesProps) {
  const queryData = useQuery({
    ...queries.services.list(environmentId!),
    enabled: Boolean(environmentId),
  })

  return {
    ...queryData,
    data: queryData.data?.length,
  }
}

export default useCountServices
