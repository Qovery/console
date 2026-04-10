import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

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
  return useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId }),
    suspense,
    select: (data) =>
      data?.filter((history) =>
        history.stages?.some((stage) => stage.services?.some((service) => service.identifier.service_id === serviceId))
      ),
  })
}

export default useServiceDeploymentHistory
