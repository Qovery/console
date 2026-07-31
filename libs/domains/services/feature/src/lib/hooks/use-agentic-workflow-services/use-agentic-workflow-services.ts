import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAgenticWorkflowServicesProps {
  environmentId: string
  suspense?: boolean
}

export function useAgenticWorkflowServices({ environmentId, suspense = false }: UseAgenticWorkflowServicesProps) {
  return useQuery({
    ...queries.services.listAgenticWorkflows(environmentId),
    suspense,
  })
}

export default useAgenticWorkflowServices
