import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export type UseAnnotationsGroupProps = Parameters<typeof queries.services.annotationsGroup>[0]

export function useAnnotationsGroup(props: UseAnnotationsGroupProps) {
  return useQuery({
    ...queries.services.annotationsGroup(props),
  })
}

export default useAnnotationsGroup
