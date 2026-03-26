import { useMemo } from 'react'
import { useDeploymentHistory } from '../use-deployment-history/use-deployment-history'

export interface UseServiceDeploymentHistoryProps {
  environmentId: string
  serviceId: string
  suspense?: boolean
}

export function useServiceDeploymentHistory({
  environmentId,
  serviceId,
  suspense = false,
}: UseServiceDeploymentHistoryProps) {
  const query = useDeploymentHistory({ environmentId, suspense })

  const data = useMemo(
    () =>
      (query.data ?? []).filter((history) =>
        history.stages?.some((stage) => stage.services?.some((service) => service.identifier.service_id === serviceId))
      ),
    [query.data, serviceId]
  )

  return {
    ...query,
    data,
  }
}

export default useServiceDeploymentHistory
