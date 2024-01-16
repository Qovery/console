import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

type ListInstanceTypesParameters = Parameters<typeof queries.cloudProviders.listInstanceTypes>[0]

export type UseCloudProviderInstanceTypesProps = ({ enabled?: true } & ListInstanceTypesParameters) | { enabled: false }

export function useCloudProviderInstanceTypes({ enabled, ...args }: UseCloudProviderInstanceTypesProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypes(args as ListInstanceTypesParameters),
    enabled,
  })
}

export default useCloudProviderInstanceTypes
