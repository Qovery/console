import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAgenticWorkflowContextServices(environmentId: string) {
  return useQuery({
    ...queries.services.list(environmentId),
    enabled: Boolean(environmentId),
    select: (services) =>
      services
        .filter(({ serviceType }) => serviceType !== 'AGENTIC_WORKFLOW')
        .map(({ id, name, serviceType }) => ({ id, name, type: serviceType })),
  })
}
