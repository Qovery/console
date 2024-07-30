import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLifecycleTemplateProps {
  environmentId: string
  templateId: string
}

export function useLifecycleTemplate({ environmentId, templateId }: UseLifecycleTemplateProps) {
  return useQuery({
    ...queries.environments.lifecycleTemplate({ environmentId, templateId }),
  })
}

export default useLifecycleTemplate
