import { useQuery } from '@tanstack/react-query'
import { type HelmDefaultValuesRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export function useHelmDefaultValues({
  environmentId,
  helmDefaultValuesRequest,
  enabled = true,
}: {
  environmentId: string
  helmDefaultValuesRequest: HelmDefaultValuesRequest
  enabled?: boolean
}) {
  return useQuery({
    ...queries.serviceHelm.helmDefaultValues({
      environmentId,
      helmDefaultValuesRequest,
    }),
    enabled,
    meta: {
      notifyOnError: true,
    },
  })
}

export default useHelmDefaultValues
