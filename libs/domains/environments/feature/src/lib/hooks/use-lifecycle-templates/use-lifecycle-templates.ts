import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLifecycleTemplatesProps {
  environmentId: string
}

export function useLifecycleTemplates({ environmentId }: UseLifecycleTemplatesProps) {
  return useQuery({
    ...queries.environments.listLifecycleTemplates({ environmentId }),
  })
}

export default useLifecycleTemplates
