import { useQuery } from '@tanstack/react-query'

type QoveryStatus = Array<{
  id: string
  name: string
  status: 'OPERATIONAL' | 'PARTIALOUTAGE' | 'MINOROUTAGE' | 'MAJOROUTAGE'
  description: string
  isParent: boolean
}>

export function useQoveryStatus() {
  return useQuery({
    queryKey: ['qoveryStatus'],
    queryFn: () =>
      fetch('https://status.qovery.com/v2/components.json')
        .then((res) => res.json())
        .then((res): QoveryStatus => {
          return res?.components ?? []
        }),
  })
}
