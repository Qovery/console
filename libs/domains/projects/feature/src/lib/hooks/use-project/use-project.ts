import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectProps {
  projectId: string
}

export function useProject({ projectId }: UseProjectProps) {
  return useQuery({
    ...queries.projects.detail({ projectId }),
  })
}

export default useProject
