import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLifecycleTemplatesProps {
  environmentId: string
  suspense?: boolean
}

export function useLifecycleTemplates({ environmentId, suspense = false }: UseLifecycleTemplatesProps) {
  return useQuery({
    ...queries.environments.listLifecycleTemplates({ environmentId }),
    suspense,
  })
}

export default useLifecycleTemplates
